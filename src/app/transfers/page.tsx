// src/app/transfers/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import TransfersClientView from './TransfersClientView';
import { auth } from '@/auth';

export const revalidate = 0;

export default async function TransfersPage() {
    const session = await auth();
    const { organizationId } = await getTenantContext();

    const warehouses = await db.warehouse.findMany({
        where: { organizationId },
        select: { id: true, name: true, code: true },
    });

    const products = await db.product.findMany({
        where: { organizationId },
        include: {
            stockLevels: {
                include: {
                    warehouse: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    const transfers = await db.stockMovement.findMany({
        where: {
            organizationId,
            type: 'TRANSFER',
        },
        include: {
            product: { select: { name: true, sku: true } },
            sourceWarehouse: { select: { name: true, code: true } },
            targetWarehouse: { select: { name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
            <Sidebar user={session?.user} />
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <TransfersClientView
                    warehouses={warehouses}
                    products={products}
                    initialTransfers={transfers}
                />
            </div>
        </div>
    );
}