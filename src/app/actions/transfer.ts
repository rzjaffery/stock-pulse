// src/app/actions/transfer.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { TransferSchema } from '@/lib/schema';
import { logAuditActivity } from "@/lib/audit";
import { TransferStatus } from '@prisma/client';

export type CreateTransferInput = {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    userId?: string;
    notes?: string;
    status?: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED';
};

export async function createTransferOrderAction(input: CreateTransferInput) {
    try {
        const { organizationId, userId } = await getTenantContext();

        // 1. Zod Validation
        const parsed = TransferSchema.safeParse({
            productId: input.productId,
            sourceWarehouseId: input.sourceWarehouseId,
            targetWarehouseId: input.targetWarehouseId,
            quantity: Number(input.quantity),
            userId: input.userId || userId || 'system',
            notes: input.notes || '',
        });

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            const errorMessage = Object.entries(fieldErrors)
                .map(([k, v]) => `${k}: ${(v as string[] | undefined)?.join(', ')}`)
                .join(' | ');
            return { success: false, error: errorMessage };
        }

        const { productId, sourceWarehouseId, targetWarehouseId, quantity, notes } = parsed.data;
        const initialStatus = (input.status || 'IN_TRANSIT') as TransferStatus;

        // 2. Execute Transaction
        await db.$transaction(async (tx) => {
            // Check source stock
            const sourceStock = await tx.stockLevel.findFirst({
                where: { organizationId, productId, warehouseId: sourceWarehouseId },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error(`Insufficient stock in source warehouse. Available: ${sourceStock?.quantity || 0}`);
            }

            // Decrement source warehouse immediately when dispatched
            await tx.stockLevel.update({
                where: { id: sourceStock.id },
                data: { quantity: { decrement: quantity } },
            });

            // If status is immediately COMPLETED, increment target right away
            if (initialStatus === 'COMPLETED') {
                const targetStock = await tx.stockLevel.findFirst({
                    where: { organizationId, productId, warehouseId: targetWarehouseId },
                });

                if (targetStock) {
                    await tx.stockLevel.update({
                        where: { id: targetStock.id },
                        data: { quantity: { increment: quantity } },
                    });
                } else {
                    await tx.stockLevel.create({
                        data: {
                            organizationId,
                            productId,
                            warehouseId: targetWarehouseId,
                            quantity,
                            minThreshold: 5,
                        },
                    });
                }
            }

            // Record Transfer Order Movement first
            const movement = await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId,
                    sourceWarehouseId,
                    targetWarehouseId,
                    quantity,
                    type: 'TRANSFER',
                    status: initialStatus,
                    notes: notes || 'Inter-Warehouse Transfer Order',
                },
            });

            // Audit Trail Logging
            if (initialStatus === 'COMPLETED') {
                await logAuditActivity({
                    tx,
                    organizationId,
                    userId,
                    action: 'TRANSFER_COMPLETED',
                    entity: 'StockMovement',
                    entityId: movement.id,
                    details: `Transfer order #${movement.id.slice(-6)} dispatches and completed immediately.`,
                    metadata: {
                        productId: movement.productId,
                        quantity: movement.quantity,
                        sourceWarehouseId: movement.sourceWarehouseId,
                        targetWarehouseId: movement.targetWarehouseId,
                    },
                });
            } else {
                await logAuditActivity({
                    tx,
                    organizationId,
                    userId,
                    action: 'TRANSFER_DISPATCHED',
                    entity: 'StockMovement',
                    entityId: movement.id,
                    details: `Transfer order #${movement.id.slice(-6)} dispatched in transit.`,
                    metadata: {
                        productId: movement.productId,
                        quantity: movement.quantity,
                        sourceWarehouseId: movement.sourceWarehouseId,
                        targetWarehouseId: movement.targetWarehouseId,
                    },
                });
            }
        });

        revalidatePath('/transfers');
        revalidatePath('/analytics');
        revalidatePath('/products');
        revalidatePath('/audit');
        revalidatePath('/');

        return { success: true };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to create transfer order.' };
    }
}

export async function updateTransferStatusAction(movementId: string, newStatus: 'COMPLETED' | 'CANCELLED') {
    try {
        const { organizationId, userId } = await getTenantContext();

        await db.$transaction(async (tx) => {
            const movement = await tx.stockMovement.findFirst({
                where: { id: movementId, organizationId },
            });

            if (!movement || movement.type !== 'TRANSFER') {
                throw new Error('Transfer order not found.');
            }

            if (movement.status === 'COMPLETED' || movement.status === 'CANCELLED') {
                throw new Error(`Transfer order is already marked as ${movement.status}.`);
            }

            if (newStatus === 'COMPLETED' && movement.targetWarehouseId) {
                // Increment target warehouse inventory on arrival
                const targetStock = await tx.stockLevel.findFirst({
                    where: { organizationId, productId: movement.productId, warehouseId: movement.targetWarehouseId },
                });

                if (targetStock) {
                    await tx.stockLevel.update({
                        where: { id: targetStock.id },
                        data: { quantity: { increment: movement.quantity } },
                    });
                } else {
                    await tx.stockLevel.create({
                        data: {
                            organizationId,
                            productId: movement.productId,
                            warehouseId: movement.targetWarehouseId,
                            quantity: movement.quantity,
                            minThreshold: 5,
                        },
                    });
                }

                // Record Audit Trail
                await logAuditActivity({
                    tx,
                    organizationId,
                    userId,
                    action: 'TRANSFER_COMPLETED',
                    entity: 'StockMovement',
                    entityId: movementId,
                    details: `Transfer order #${movementId.slice(-6)} received at destination facility.`,
                    metadata: {
                        productId: movement.productId,
                        quantity: movement.quantity,
                        sourceWarehouseId: movement.sourceWarehouseId,
                        targetWarehouseId: movement.targetWarehouseId,
                    },
                });
            } else if (newStatus === 'CANCELLED' && movement.sourceWarehouseId) {
                // Return quantity back to source warehouse if cancelled
                const sourceStock = await tx.stockLevel.findFirst({
                    where: { organizationId, productId: movement.productId, warehouseId: movement.sourceWarehouseId },
                });

                if (sourceStock) {
                    await tx.stockLevel.update({
                        where: { id: sourceStock.id },
                        data: { quantity: { increment: movement.quantity } },
                    });
                }

                // Record Audit Trail
                await logAuditActivity({
                    tx,
                    organizationId,
                    userId,
                    action: 'TRANSFER_CANCELLED',
                    entity: 'StockMovement',
                    entityId: movementId,
                    details: `Transfer order #${movementId.slice(-6)} was cancelled and stock returned to source warehouse.`,
                    metadata: {
                        productId: movement.productId,
                        quantity: movement.quantity,
                        sourceWarehouseId: movement.sourceWarehouseId,
                    },
                });
            }

            // Update order status
            await tx.stockMovement.update({
                where: { id: movementId },
                data: { status: newStatus as TransferStatus },
            });
        });

        revalidatePath('/transfers');
        revalidatePath('/analytics');
        revalidatePath('/products');
        revalidatePath('/audit');
        revalidatePath('/');

        return { success: true };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to update transfer status.' };
    }
}