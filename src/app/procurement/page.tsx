// src/app/procurement/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import ProcurementClientView from './ProcurementClientView';

export const revalidate = 0;

export default async function ProcurementPage() {
    const { organizationId } = await getTenantContext();

    const [suppliers, purchaseOrders, lowStockLevels, warehouses, products] = await Promise.all([
        db.supplier.findMany({
            where: { organizationId },
            orderBy: { name: 'asc' },
        }),
        db.purchaseOrder.findMany({
            where: { organizationId },
            include: {
                supplier: { select: { name: true } },
                warehouse: { select: { code: true } },
                items: { include: { product: { select: { name: true, sku: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        db.stockLevel.findMany({
            where: { organizationId, quantity: { lte: db.stockLevel.fields.minThreshold } },
            include: {
                product: { select: { id: true, name: true, sku: true, unitPrice: true } },
                warehouse: { select: { id: true, name: true, code: true } },
            },
        }),
        db.warehouse.findMany({
            where: { organizationId },
            select: { id: true, name: true, code: true },
        }),
        db.product.findMany({
            where: { organizationId },
            select: { id: true, name: true, sku: true, unitPrice: true },
        }),
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
                    <div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              Procurement
            </span>
                        <h1 className="text-xl font-bold text-white tracking-tight mt-1">
                            Suppliers & Purchase Orders
                        </h1>
                    </div>
                </header>

                <main className="p-6 md:p-8 space-y-8 max-w-7xl">
                    <ProcurementClientView
                        suppliers={suppliers}
                        purchaseOrders={purchaseOrders as never}
                        lowStockItems={lowStockLevels as never}
                        warehouses={warehouses}
                        products={products}
                    />
                </main>
            </div>
        </div>
    );
}