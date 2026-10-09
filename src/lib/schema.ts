// src/lib/schemas.ts
import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    sku: z
        .string()
        .min(3, 'SKU must be at least 3 characters')
        .regex(/^[A-Za-z0-9-]+$/, 'SKU must contain only letters, numbers, and hyphens')
        .transform((val) => val.toUpperCase()),
    description: z.string().optional().default(''),
    unitPrice: z.number().positive('Price must be greater than 0'),
    warehouseId: z.string().min(1, 'Please select a target warehouse'),
    initialQuantity: z.number().int().nonnegative('Initial quantity cannot be negative').default(0),
    minThreshold: z.number().int().positive('Minimum threshold must be at least 1').default(5),
});

export const WarehouseSchema = z.object({
    name: z.string().min(2, 'Warehouse name must be at least 2 characters'),
    code: z
        .string()
        .min(2, 'Warehouse code must be at least 2 characters')
        .regex(/^[A-Za-z0-9-]+$/, 'Code must contain only letters, numbers, and hyphens')
        .transform((val) => val.toUpperCase()),
    location: z.string().optional().default(''),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type WarehouseInput = z.infer<typeof WarehouseSchema>;
export const TransferSchema = z.object({
    productId: z.string().min(1, 'Please select a product'),
    sourceWarehouseId: z.string().min(1, 'Please select a source warehouse'),
    targetWarehouseId: z.string().min(1, 'Please select a target warehouse'),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    userId: z.string().min(1, 'Please select an operator'),
    notes: z.string().optional(),
}).refine((data) => data.sourceWarehouseId !== data.targetWarehouseId, {
    message: 'Source and Target warehouses must be different',
    path: ['targetWarehouseId'],
});

export const SupplierSchema = z.object({
    name: z.string().min(2, 'Supplier name is required'),
    email: z.string().email('Invalid email address'),
    phone: z
        .string()
        .transform((val) => (val === '' ? undefined : val))
        .optional(),
    address: z
        .string()
        .transform((val) => (val === '' ? undefined : val))
        .optional(),
});

export const PurchaseOrderSchema = z.object({
    supplierId: z.string().min(1, 'Please select a supplier'),
    warehouseId: z.string().min(1, 'Please select a destination warehouse'),
    productId: z.string().min(1, 'Please select a product'),
    quantityOrdered: z.coerce
        .number()
        .int('Quantity must be an integer')
        .positive('Quantity must be greater than 0'),
    unitCost: z.coerce
        .number()
        .positive('Unit cost must be greater than 0'),
    notes: z
        .string()
        .transform((val) => (val === '' ? undefined : val))
        .optional(),
});