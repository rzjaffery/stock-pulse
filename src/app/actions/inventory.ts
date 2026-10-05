// src/app/actions/inventory.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export interface TransferStockInput {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    notes?: string;
    userId?: string; // Made optional to prevent TS errors
}

export async function transferStockAction(input: TransferStockInput) {
    try {
        const { organizationId, userId: contextUserId } = await getTenantContext();
        const activeUserId = input.userId || contextUserId;

        const result = await db.$transaction(async (tx) => {
            // 1. Verify source stock within TENANT ONLY
            const sourceStock = await tx.stockLevel.findFirst({
                where: {
                    organizationId,
                    productId: input.productId,
                    warehouseId: input.sourceWarehouseId,
                },
            });

            if (!sourceStock || sourceStock.quantity < input.quantity) {
                throw new Error(`Insufficient stock. Available: ${sourceStock?.quantity || 0}`);
            }

            // 2. Decrement source stock
            await tx.stockLevel.update({
                where: { id: sourceStock.id },
                data: { quantity: { decrement: input.quantity } },
            });

            // 3. Upsert target stock scoped to organization
            await tx.stockLevel.upsert({
                where: {
                    organizationId_productId_warehouseId: {
                        organizationId,
                        productId: input.productId,
                        warehouseId: input.targetWarehouseId,
                    },
                },
                update: { quantity: { increment: input.quantity } },
                create: {
                    organizationId,
                    productId: input.productId,
                    warehouseId: input.targetWarehouseId,
                    quantity: input.quantity,
                    minThreshold: 10,
                },
            });

            // 4. Audit Log
            return await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId: input.productId,
                    sourceWarehouseId: input.sourceWarehouseId,
                    targetWarehouseId: input.targetWarehouseId,
                    userId: activeUserId,
                    quantity: input.quantity,
                    type: 'TRANSFER',
                    notes: input.notes,
                },
            });
        });

        revalidatePath('/');
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}