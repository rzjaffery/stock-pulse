// src/app/actions/analytics.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';

export async function getAnalyticsData() {
    const { organizationId } = await getTenantContext();

    const [stockLevels, movements, warehouses] = await Promise.all([
        db.stockLevel.findMany({
            where: { organizationId },
            include: {
                product: { select: { id: true, name: true, sku: true, unitPrice: true, categoryId: true } },
                warehouse: { select: { id: true, name: true, code: true } },
            },
        }),
        db.stockMovement.findMany({
            where: { organizationId },
            include: { product: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        }),
        db.warehouse.findMany({
            where: { organizationId },
            select: { id: true, name: true, code: true },
        }),
        db.category.findMany({
            where: { organizationId },
            select: { id: true, name: true },
        }),
    ]);

    // Valuation per warehouse
    const warehouseValuation = warehouses.map((wh) => {
        const totalVal = stockLevels
            .filter((s) => s.warehouseId === wh.id)
            .reduce((sum, item) => sum + item.quantity * item.product.unitPrice, 0);

        const totalItems = stockLevels
            .filter((s) => s.warehouseId === wh.id)
            .reduce((sum, item) => sum + item.quantity, 0);

        return {
            id: wh.id,
            name: wh.name,
            code: wh.code,
            totalValuation: totalVal,
            totalItems,
        };
    });

    // Movement breakdown
    const movementStats = {
        totalTransfers: movements.filter((m) => m.type === 'TRANSFER').length,
        totalInbound: movements.filter((m) => m.type === 'INBOUND').length,
        totalOutbound: movements.filter((m) => m.type === 'OUTBOUND').length,
        totalAdjustments: movements.filter((m) => m.type === 'ADJUSTMENT').length,
    };

    // Low stock alert items
    const lowStockItems = stockLevels
        .filter((s) => s.quantity <= s.minThreshold)
        .map((s) => ({
            id: s.id,
            productName: s.product.name,
            sku: s.product.sku,
            warehouseName: s.warehouse.name,
            quantity: s.quantity,
            minThreshold: s.minThreshold,
        }));

    return {
        warehouseValuation,
        movementStats,
        lowStockItems,
        totalValuation: warehouseValuation.reduce((sum, w) => sum + w.totalValuation, 0),
        totalUnitsInStock: warehouseValuation.reduce((sum, w) => sum + w.totalItems, 0),
    };
}