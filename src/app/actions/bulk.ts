// src/app/actions/bulk.ts
'use server';

import { db } from '@/lib/db';
import {ProductSchema, WarehouseSchema} from "@/lib/schema";
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

export async function bulkImportProductsAction(products: any[]) {
    const { organizationId } = await getTenantContext();

    const validatedProducts: any[] = [];
    const errors: string[] = [];

    // Validate each row against Zod schema
    for (let i = 0; i < products.length; i++) {
        const row = products[i];
        const parsed = ProductSchema.safeParse({
            name: row.name,
            sku: row.sku,
            description: row.description || '',
            unitPrice: Number(row.unitPrice),
            warehouseId: row.warehouseId,
            initialQuantity: Number(row.initialQuantity || 0),
            minThreshold: Number(row.minThreshold || 5),
        });

        if (!parsed.success) {
            errors.push(`Row ${i + 1} (${row.sku || 'Unknown SKU'}): ${parsed.error.issues[0].message}`);
        } else {
            validatedProducts.push(parsed.data);
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    // Execute bulk insertion in Prisma
    try {
        await db.$transaction(async (tx) => {
            for (const prod of validatedProducts) {
                const product = await tx.product.create({
                    data: {
                        organizationId,
                        name: prod.name,
                        sku: prod.sku,
                        description: prod.description,
                        unitPrice: prod.unitPrice,
                        categoryId: prod.categoryId || null, // or pass a default category ID
                    },
                });

                // Initialize stock level at target warehouse
                await tx.stockLevel.create({
                    data: {
                        organizationId,
                        productId: product.id,
                        warehouseId: prod.warehouseId,
                        quantity: prod.initialQuantity,
                        minThreshold: prod.minThreshold,
                    },
                });

                // Log initial inbound movement
                if (prod.initialQuantity > 0) {
                    await tx.stockMovement.create({
                        data: {
                            organizationId,
                            type: 'INBOUND',
                            productId: product.id,
                            targetWarehouseId: prod.warehouseId,
                            quantity: prod.initialQuantity,
                            notes: 'Bulk CSV Initial Import',
                            userId: userId, // Pass the authenticated user ID here
                        },
                    });
                }
            }
        });

        revalidatePath('/products');
        revalidatePath('/analytics');
        revalidatePath('/');
        return { success: true, count: validatedProducts.length };
    } catch (error: any) {
        return { success: false, errors: [error.message || 'Database error during bulk upload'] };
    }
}

export async function bulkImportWarehousesAction(warehouses: any[]) {
    const { organizationId } = await getTenantContext();

    const validatedWarehouses = [];
    const errors: string[] = [];

    for (let i = 0; i < warehouses.length; i++) {
        const row = warehouses[i];
        const parsed = WarehouseSchema.safeParse({
            name: row.name,
            code: row.code,
            location: row.location || '',
        });

        if (!parsed.success) {
            errors.push(`Row ${i + 1} (${row.code || 'Unknown Code'}): ${parsed.error.issues[0].message}`);
        } else {
            validatedWarehouses.push(parsed.data);
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    try {
        await db.warehouse.createMany({
            data: validatedWarehouses.map((wh) => ({
                ...wh,
                organizationId,
            })),
            skipDuplicates: true,
        });

        revalidatePath('/warehouses');
        revalidatePath('/analytics');
        revalidatePath('/');
        return { success: true, count: validatedWarehouses.length };
    } catch (error: any) {
        return { success: false, errors: [error.message || 'Failed to import warehouses'] };
    }
}