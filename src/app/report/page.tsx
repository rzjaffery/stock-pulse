// src/app/reports/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import ReportsClientView from './ReportsClientView';
import { auth } from '@/auth';

export const revalidate = 0;

export default async function ReportsPage() {
    const session = await auth();
    const { organizationId } = await getTenantContext();

    // Fetch products with stock levels across warehouses
    const products = await db.product.findMany({
        where: { organizationId },
        include: {
            stockLevels: {
                include: {
                    warehouse: { select: { name: true, code: true } },
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    // Fetch transfers movement history
    const transfers = await db.stockMovement.findMany({
        where: { organizationId },
        include: {
            product: { select: { name: true, sku: true } },
            sourceWarehouse: { select: { name: true, code: true } },
            targetWarehouse: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    // Fetch purchase orders
    const purchaseOrders = await db.purchaseOrder.findMany({
        where: { organizationId },
        include: {
            supplier: { select: { name: true } },
            warehouse: { select: { name: true, code: true } },
            items: {
                include: { product: { select: { name: true, sku: true } } },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    // Fetch audit trail
    const auditLogs = await db.auditLog.findMany({
        where: { organizationId },
        include: {
            user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
            <Sidebar user={session?.user} />
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <ReportsClientView
                    products={products}
                    transfers={transfers}
                    purchaseOrders={purchaseOrders}
                    auditLogs={auditLogs}
                />
            </div>
        </div>
    );
}