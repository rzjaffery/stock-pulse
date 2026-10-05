// src/app/actions/inventory.ts
'use server';

import { db } from '@/lib/db';
import { MovementType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {sendLowStockAlertEmail} from "@/lib/email";

export interface TransferStockInput {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    userId: string;
    notes?: string;
}

export async function transferStockAction(input: TransferStockInput) {
    const { productId, sourceWarehouseId, targetWarehouseId, quantity, userId, notes } = input;

    if (quantity <= 0) {
        return { success: false, error: 'Transfer quantity must be greater than zero.' };
    }

    if (sourceWarehouseId === targetWarehouseId) {
        return { success: false, error: 'Source and target warehouses cannot be the same.' };
    }

    try {
        // Run all steps in a single atomic database transaction
        const result = await db.$transaction(async (tx) => {
            // 1. Check current stock level at the source warehouse
            const sourceStock = await tx.stockLevel.findUnique({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId: sourceWarehouseId,
                    },
                },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error(
                    `Insufficient stock. Source warehouse only has ${sourceStock?.quantity || 0} units available.`
                );
            }

            // 2. Deduct inventory from Source Warehouse
            await tx.stockLevel.update({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId: sourceWarehouseId,
                    },
                },
                data: {
                    quantity: { decrement: quantity },
                },
            });

            // 3. Add inventory to Target Warehouse (upsert handles case where stock row doesn't exist yet)
            await tx.stockLevel.upsert({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId: targetWarehouseId,
                    },
                },
                update: {
                    quantity: { increment: quantity },
                },
                create: {
                    productId,
                    warehouseId: targetWarehouseId,
                    quantity,
                    minThreshold: 10,
                },
            });

            // 4. Record the StockMovement Audit Trail
            const movement = await tx.stockMovement.create({
                data: {
                    type: MovementType.TRANSFER,
                    quantity,
                    productId,
                    sourceWarehouseId,
                    targetWarehouseId,
                    userId,
                    notes: notes || 'Internal inter-warehouse transfer',
                },
            });

            // 5. Create a system Audit Log entry
            await tx.auditLog.create({
                data: {
                    action: 'STOCK_TRANSFER',
                    entity: 'StockLevel',
                    entityId: productId,
                    userId,
                    details: JSON.stringify({
                        from: sourceWarehouseId,
                        to: targetWarehouseId,
                        qty: quantity,
                    }),
                },
            });
            const updatedSourceStock = await tx.stockLevel.findUnique({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId: sourceWarehouseId,
                    },
                },
                include: {
                    product: true,
                    warehouse: true,
                },
            });

            if (updatedSourceStock && updatedSourceStock.quantity <= updatedSourceStock.minThreshold) {
                // Fire-and-forget alert email after successful commit
                sendLowStockAlertEmail({
                    productName: updatedSourceStock.product.name,
                    sku: updatedSourceStock.product.sku,
                    warehouseName: updatedSourceStock.warehouse.name,
                    warehouseCode: updatedSourceStock.warehouse.code,
                    currentQuantity: updatedSourceStock.quantity,
                    minThreshold: updatedSourceStock.minThreshold,
                });
            }

            return movement;
        });

        // Refresh Next.js Server Component cache instantly
        revalidatePath('/inventory');
        revalidatePath('/dashboard');



        return { success: true, data: result };
    } catch (error:any) {
        console.error('Transfer Error:', error);
        return { success: false, error: error.message || 'Failed to complete stock transfer.' };
    }
}