// src/app/actions/transfer.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { TransferSchema } from '@/lib/schema';

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
        const { organizationId } = await getTenantContext();

        // 1. Zod Validation
        const parsed = TransferSchema.safeParse({
            productId: input.productId,
            sourceWarehouseId: input.sourceWarehouseId,
            targetWarehouseId: input.targetWarehouseId,
            quantity: Number(input.quantity),
            userId: input.userId || 'system',
            notes: input.notes || '',
        });

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            const errorMessage = Object.entries(fieldErrors)
                .map(([k, v]) => `${k}: ${v?.join(', ')}`)
                .join(' | ');
            return { success: false, error: errorMessage };
        }

        const { productId, sourceWarehouseId, targetWarehouseId, quantity, notes } = parsed.data;
        const initialStatus = input.status || 'IN_TRANSIT';

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

            // Record Transfer Order Movement
            await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId,
                    sourceWarehouseId,
                    targetWarehouseId,
                    quantity,
                    type: 'TRANSFER',
                    status: initialStatus as never,
                    notes: notes || 'Inter-Warehouse Transfer Order',
                },
            });
        });

        revalidatePath('/transfers');
        revalidatePath('/analytics');
        revalidatePath('/products');
        revalidatePath('/');

        return { success: true };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to create transfer order.' };
    }
}

export async function updateTransferStatusAction(movementId: string, newStatus: 'COMPLETED' | 'CANCELLED') {
    try {
        const { organizationId } = await getTenantContext();

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
            }

            // Update order status
            await tx.stockMovement.update({
                where: { id: movementId },
                data: { status: newStatus as any },
            });
        });

        revalidatePath('/transfers');
        revalidatePath('/analytics');
        revalidatePath('/products');
        revalidatePath('/');

        return { success: true };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to update transfer status.' };
    }
}