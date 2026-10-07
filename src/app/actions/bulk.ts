// src/app/actions/bulk.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { ProductSchema, WarehouseSchema, ProductInput, WarehouseInput } from '@/lib/schema';

// Interface for bulk action return types
export type BulkImportResult = {
    success: boolean;
    count?: number;
    errors?: string[];
};

// Interface for raw CSV row data passed from Papaparse
export type RawProductRow = Record<string, string | number | undefined>;
export type RawWarehouseRow = Record<string, string | number | undefined>;

export async function bulkImportProductsAction(
    products: RawProductRow[]
): Promise<BulkImportResult> {
    try {
        const { organizationId } = await getTenantContext();

        const validatedProducts: ProductInput[] = [];
        const errorList: string[] = [];

        // 1. Validate each row against Zod schema
        for (let i = 0; i < products.length; i++) {
            const row = products[i];
            const parsed = ProductSchema.safeParse({
                name: row.name,
                sku: row.sku,
                description: typeof row.description === 'string' ? row.description : '',
                unitPrice: Number(row.unitPrice),
                warehouseId: row.warehouseId,
                initialQuantity: Number(row.initialQuantity ?? 0),
                minThreshold: Number(row.minThreshold ?? 5),
            });

            if (!parsed.success) {
                const fieldErrors = parsed.error.flatten().fieldErrors;
                const formattedErrors = Object.entries(fieldErrors)
                    .map(([field, messages]) => {
                        const messageArray = messages as string[] | undefined;
                        return `${field}: ${messageArray ? messageArray.join(', ') : 'Invalid value'}`;
                    })
                    .join(' | ');

                const identifier = typeof row.sku === 'string' ? row.sku : 'Unknown SKU';
                errorList.push(`Row ${i + 1} (${identifier}): ${formattedErrors}`);
            } else {
                validatedProducts.push(parsed.data);
            }
        }

        if (errorList.length > 0) {
            return { success: false, errors: errorList };
        }

        // 2. Atomic database transaction
        await db.$transaction(async (tx) => {
            // Fetch or create default category for organization
            let category = await tx.category.findFirst({ where: { organizationId } });
            if (!category) {
                category = await tx.category.create({
                    data: { organizationId, name: 'General Catalog' },
                });
            }

            for (const prod of validatedProducts) {
                const product = await tx.product.create({
                    data: {
                        organizationId,
                        categoryId: category.id,
                        name: prod.name,
                        sku: prod.sku,
                        description: prod.description,
                        unitPrice: prod.unitPrice,
                    },
                });

                // Create initial stock level
                await tx.stockLevel.create({
                    data: {
                        organizationId,
                        productId: product.id,
                        warehouseId: prod.warehouseId,
                        quantity: prod.initialQuantity,
                        minThreshold: prod.minThreshold,
                    },
                });

                // Record inbound stock movement
                if (prod.initialQuantity > 0) {
                    await tx.stockMovement.create({
                        data: {
                            organizationId,
                            productId: product.id,
                            targetWarehouseId: prod.warehouseId,
                            quantity: prod.initialQuantity,
                            type: 'INBOUND',
                            notes: 'Bulk CSV Initial Import',
                        },
                    });
                }
            }
        });

        revalidatePath('/products');
        revalidatePath('/analytics');
        revalidatePath('/');

        return { success: true, count: validatedProducts.length };
    } catch (err) {
        const errorObject = err as Error;
        return {
            success: false,
            errors: [errorObject.message || 'Database error occurred during bulk product import.'],
        };
    }
}

export async function bulkImportWarehousesAction(
    warehouses: RawWarehouseRow[]
): Promise<BulkImportResult> {
    try {
        const { organizationId } = await getTenantContext();

        const validatedWarehouses: WarehouseInput[] = [];
        const errorList: string[] = [];

        // 1. Validate warehouse rows
        for (let i = 0; i < warehouses.length; i++) {
            const row = warehouses[i];
            const parsed = WarehouseSchema.safeParse({
                name: row.name,
                code: row.code,
                location: typeof row.location === 'string' ? row.location : '',
            });

            if (!parsed.success) {
                const fieldErrors = parsed.error.flatten().fieldErrors;
                const formattedErrors = Object.entries(fieldErrors)
                    .map(([field, messages]) => {
                        const messageArray = messages as string[] | undefined;
                        return `${field}: ${messageArray ? messageArray.join(', ') : 'Invalid value'}`;
                    })
                    .join(' | ');

                const identifier = typeof row.code === 'string' ? row.code : 'Unknown Code';
                errorList.push(`Row ${i + 1} (${identifier}): ${formattedErrors}`);
            } else {
                validatedWarehouses.push(parsed.data);
            }
        }

        if (errorList.length > 0) {
            return { success: false, errors: errorList };
        }

        // 2. Batch insert warehouses
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
    } catch (err) {
        const errorObject = err as Error;
        return {
            success: false,
            errors: [errorObject.message || 'Failed to bulk import warehouses.'],
        };
    }
}