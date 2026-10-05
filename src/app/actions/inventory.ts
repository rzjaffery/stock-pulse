// src/app/actions/inventory.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export async function getFilteredInventory(search?: string, warehouseId?: string) {
    const { organizationId } = await getTenantContext();

    const stockLevels = await db.stockLevel.findMany({
        where: {
            organizationId,
            ...(warehouseId && warehouseId !== 'all' ? { warehouseId } : {}),
            ...(search
                ? {
                    product: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { sku: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                }
                : {}),
        },
        include: {
            product: { select: { name: true, sku: true, unitPrice: true } },
            warehouse: { select: { name: true, code: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });

    return stockLevels;
}

export async function getFilteredMovements(type?: string) {
    const { organizationId } = await getTenantContext();

    const movements = await db.stockMovement.findMany({
        where: {
            organizationId,
            ...(type && type !== 'all' ? { type: type as any } : {}),
        },
        include: {
            product: { select: { name: true, sku: true } },
            sourceWarehouse: { select: { name: true, code: true } },
            targetWarehouse: { select: { name: true, code: true } },
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    return movements;
}

export type TransferStockParams = {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    userId: string;
    notes?: string;
};

export async function transferStockAction(params: TransferStockParams) {
    try {
        const { organizationId } = await getTenantContext();
        const { productId, sourceWarehouseId, targetWarehouseId, quantity, userId, notes } = params;

        // Validation checks
        if (!productId || !sourceWarehouseId || !targetWarehouseId || !userId) {
            return { success: false, error: 'All fields are required.' };
        }

        if (sourceWarehouseId === targetWarehouseId) {
            return { success: false, error: 'Source and target warehouses must be different.' };
        }

        if (quantity <= 0) {
            return { success: false, error: 'Quantity must be greater than zero.' };
        }

        // Execute atomic transaction
        await db.$transaction(async (tx) => {
            // 1. Fetch source stock level
            const sourceStock = await tx.stockLevel.findFirst({
                where: { organizationId, productId, warehouseId: sourceWarehouseId },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error(
                    `Insufficient stock in source warehouse. Available: ${sourceStock?.quantity || 0}`
                );
            }

            // 2. Decrement source warehouse stock
            await tx.stockLevel.update({
                where: { id: sourceStock.id },
                data: { quantity: { decrement: quantity } },
            });

            // 3. Upsert target warehouse stock
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

            // 4. Create stock movement audit record
            await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId,
                    sourceWarehouseId,
                    targetWarehouseId,
                    userId,
                    quantity,
                    type: 'TRANSFER',
                    notes,
                },
            });
        });

        // Revalidate dashboard caches to immediately reflect updated stock numbers
        revalidatePath('/');

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || 'Failed to complete stock transfer.',
        };
    }
}