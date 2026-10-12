// src/app/actions/transfer.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { AuditAction, MovementType } from '@prisma/client';

export type TransferParams = {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    notes?: string;
};

export async function transferStockAction(params: TransferParams) {
    try {
        const { userId, organizationId, role } = await getTenantContext();
        const { productId, sourceWarehouseId, targetWarehouseId, quantity, notes } = params;

        if (!productId || !sourceWarehouseId || !targetWarehouseId || quantity <= 0) {
            return { success: false, error: 'Please provide valid transfer parameters and quantity.' };
        }

        if (sourceWarehouseId === targetWarehouseId) {
            return { success: false, error: 'Source and destination warehouses cannot be the same.' };
        }

        if (role !== 'ADMIN' && role !== 'MANAGER') {
            return { success: false, error: 'Unauthorized: Operator clearance cannot authorize inter-warehouse transfers.' };
        }

        await db.$transaction(async (tx) => {
            // 1. Verify source stock level exists and has enough quantity
            const sourceStock = await tx.stockLevel.findFirst({
                where: {
                    organizationId,
                    productId,
                    warehouseId: sourceWarehouseId,
                },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error('Insufficient stock in the source warehouse for this transfer.');
            }

            // 2. Decrement stock in source warehouse
            await tx.stockLevel.update({
                where: { id: sourceStock.id },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                },
            });

            // 3. Find or create destination stock level
            const targetStock = await tx.stockLevel.findFirst({
                where: {
                    organizationId,
                    productId,
                    warehouseId: targetWarehouseId,
                },
            });

            if (targetStock) {
                await tx.stockLevel.update({
                    where: { id: targetStock.id },
                    data: {
                        quantity: {
                            increment: quantity,
                        },
                    },
                });
            } else {
                await tx.stockLevel.create({
                    data: {
                        organizationId,
                        productId,
                        warehouseId: targetWarehouseId,
                        quantity,
                        minThreshold: sourceStock.minThreshold,
                    },
                });
            }

            // 4. Record Stock Movement
            await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId,
                    sourceWarehouseId,
                    targetWarehouseId,
                    quantity,
                    type: MovementType.TRANSFER,
                    notes: notes || `Transferred ${quantity} units between warehouses`,
                },
            });

            // 5. Record Audit Log
            await tx.auditLog.create({
                data: {
                    organizationId,
                    userId,
                    action: AuditAction.TRANSFER_DISPATCHED,
                    entity: 'StockMovement',
                    entityId: productId,
                    details: `Transferred ${quantity} units of product ID ${productId} from warehouse ${sourceWarehouseId} to ${targetWarehouseId}`,
                },
            });
        });

        revalidatePath('/transfers');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to process stock transfer.' };
    }
}