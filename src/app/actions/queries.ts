'use server'

import {db} from "@/lib/db";

export async function getDashboardMetrics (){
    const [totalProducts, warehouses, stockLevels, recentMovements] = await Promise.all([
        db.product.count(),
        db.warehouse.findMany({
            include: {
                stockLevels: {
                    include: { product: true },
                },
            },
        }),
        db.stockLevel.findMany({
            include: {
                product: true,
                warehouse: true,
            },
        }),
        db.stockMovement.findMany({
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
        (item)=> item.quantity <= item.minThreshold
    )

    const totalValuation = stockLevels.reduce(
        (acc, item) => acc + (item.quantity * item.product.price),
        0
    )

    return {
        totalProducts,
        totalValuation,
        totalWarehouses: warehouses.length,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        recentMovements
    }

}