// src/app/actions/queries.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';

export async function getDashboardMetrics() {
    const { organizationId } = await getTenantContext();

    const [totalProducts, warehouses, stockLevels, recentMovements] = await Promise.all([
        db.product.count({ where: { organizationId } }),
        db.warehouse.findMany({
            where: { organizationId },
            include: {
                stockLevels: {
                    where: { organizationId },
                    include: { product: true },
                },
            },
        }),
        db.stockLevel.findMany({
            where: { organizationId },
            include: {
                product: true,
                warehouse: true,
            },
        }),
        db.stockMovement.findMany({
            where: { organizationId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                sourceWarehouse: true,
                targetWarehouse: true,
                user: true,
            },
        }),
    ]);

    const lowStockItems = stockLevels.filter(
        (item) => item.quantity <= item.minThreshold
    );

    const totalValuation = stockLevels.reduce(
        (acc, item) => acc + item.quantity * item.product.unitPrice,
        0
    );

    return {
        totalProducts,
        totalValuation,
        totalWarehouses: warehouses.length,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        recentMovements,
    };
}