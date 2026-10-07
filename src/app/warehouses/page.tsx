// src/app/warehouses/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import WarehousesClientView from './WarehousesClientView';

export const revalidate = 0;

export default async function WarehousesPage() {
    const { organizationId } = await getTenantContext();

    const warehouses = await db.warehouse.findMany({
        where: { organizationId },
        include: {
            _count: {
                select: { stockLevels: true },
            },
            stockLevels: {
                select: { quantity: true },
            },
        },
        orderBy: { code: 'asc' },
    });

    const formattedWarehouses = warehouses.map((wh) => ({
        id: wh.id,
        name: wh.name,
        code: wh.code,
        location: wh.location,
        totalSkus: wh._count.stockLevels,
        totalItems: wh.stockLevels.reduce((acc, s) => acc + s.quantity, 0),
    }));

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <WarehousesClientView initialWarehouses={formattedWarehouses} />
            </div>
        </div>
    );
}