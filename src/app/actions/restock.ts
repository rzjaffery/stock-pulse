// src/app/actions/restock.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { AuditAction, MovementType } from '@prisma/client';

export async function quickRestockAction(stockLevelId: string, addQuantity: number) {
    try {
        const { userId, organizationId } = await getTenantContext();

        if (addQuantity <= 0) {
            return { success: false, error: 'Restock quantity must be greater than zero.' };
        }

        await db.$transaction(async (tx) => {
            // 1. Find the target stock level record and ensure it belongs to the tenant
            const stockLevel = await tx.stockLevel.findFirst({
                where: { id: stockLevelId, organizationId },
                include: { product: true, warehouse: true },
            });

            if (!stockLevel) {
                throw new Error('Stock level record not found.');
            }

            // 2. Increment stock quantity
            const updatedStock = await tx.stockLevel.update({
                where: { id: stockLevelId },
                data: {
                    quantity: {
                        increment: addQuantity,
                    },
                },
            });

            // 3. Record an inbound stock movement
            await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId: stockLevel.productId,
                    targetWarehouseId: stockLevel.warehouseId,
                    quantity: addQuantity,
                    type: MovementType.INBOUND,
                    notes: `Quick restock action: added +${addQuantity} units`,
                },
            });

            // 4. Record audit log
            await tx.auditLog.create({
                data: {
                    organizationId,
                    userId,
                    action: AuditAction.STOCK_ADJUSTED,
                    entity: 'StockLevel',
                    entityId: stockLevel.id,
                    details: `Quick restocked ${addQuantity} units for product "${stockLevel.product.name}" at warehouse "${stockLevel.warehouse.name}"`,
                },
            });
        });

        revalidatePath('/');
        revalidatePath('/products');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to process restock.' };
    }
}