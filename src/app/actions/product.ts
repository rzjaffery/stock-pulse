// src/app/actions/product.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export type CreateProductParams = {
    name: string;
    sku: string;
    description?: string;
    unitPrice: number;
    warehouseId?: string;
    initialQuantity: number;
    minThreshold?: number;
};

export async function createProductAction(params: CreateProductParams) {
    try {
        const { organizationId } = await getTenantContext();
        const { name, sku, description, unitPrice, initialQuantity, minThreshold } = params;
        let { warehouseId } = params;

        if (!name || !sku || unitPrice < 0 || initialQuantity < 0) {
            return { success: false, error: 'Please provide valid values for all required fields.' };
        }

        // Execute atomic creation of Product + Initial Stock Level
        await db.$transaction(async (tx) => {
            // 1. Ensure at least one Warehouse exists for this organization
            if (!warehouseId) {
                let existingWarehouse = await tx.warehouse.findFirst({ where: { organizationId } });
                if (!existingWarehouse) {
                    existingWarehouse = await tx.warehouse.create({
                        data: {
                            organizationId,
                            name: 'Main Distribution Hub',
                            code: 'WH-MAIN-01',
                            location: 'Headquarters',
                        },
                    });
                }
                warehouseId = existingWarehouse.id;
            }

            // 2. Ensure Category exists
            let category = await tx.category.findFirst({ where: { organizationId } });
            if (!category) {
                category = await tx.category.create({
                    data: { organizationId, name: 'General Inventory' },
                });
            }

            // 3. Create Product stamped with active organizationId
            const product = await tx.product.create({
                data: {
                    organizationId,
                    categoryId: category.id,
                    name,
                    sku,
                    description,
                    unitPrice,
                },
            });

            // 4. Set Initial Stock Level in the target warehouse
            await tx.stockLevel.create({
                data: {
                    organizationId,
                    productId: product.id,
                    warehouseId,
                    quantity: initialQuantity,
                    minThreshold: minThreshold || 5,
                },
            });

            // 5. Log initial movement
            await tx.stockMovement.create({
                data: {
                    organizationId,
                    productId: product.id,
                    targetWarehouseId: warehouseId,
                    quantity: initialQuantity,
                    type: 'INBOUND',
                    notes: 'Initial stock setup upon product creation',
                },
            });
        });

        revalidatePath('/');
        return { success: true };
    } catch (error:any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'A product with this SKU already exists.' };
        }
        return { success: false, error: error?.message || 'Failed to create product.' };
    }
}