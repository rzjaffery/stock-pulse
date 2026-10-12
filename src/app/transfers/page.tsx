// src/app/transfers/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import TransferModal from '@/components/TransferModal';
import TransferTableClient from './TransferTableClient';

export const revalidate = 0;

export default async function TransfersPage() {
    const { organizationId } = await getTenantContext();

    const [transfers, warehouses, products, rawUsers] = await Promise.all([
        db.stockMovement.findMany({
            where: { organizationId, type: 'TRANSFER' },
            include: {
                product: { select: { name: true, sku: true } },
                sourceWarehouse: { select: { name: true, code: true } },
                targetWarehouse: { select: { name: true, code: true } },
                user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        db.warehouse.findMany({
            where: { organizationId },
            select: { id: true, name: true, code: true },
        }),
        db.product.findMany({
            where: { organizationId },
            select: { id: true, name: true, sku: true },
        }),
        db.user.findMany({
            where: { organizationId },
            select: { id: true, name: true, email: true },
        }),
    ]);

    const users = rawUsers.map((u) => ({
        id: u.id,
        name: u.name || u.email || 'Operator',
    }));

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Logistics
            </span>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                            Inter-Warehouse Transfer Orders
                        </h1>
                    </div>

                    <TransferModal
                        warehouses={warehouses}
                        products={products}
                        users={users}
                        triggerButton={
                            <button className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-2">
                                + Create Transfer Order
                            </button>
                        }
                    />
                </header>

                <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                    {/* Executive Overview KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Total Transfers</span>
                            <p className="text-2xl font-bold mt-1 text-slate-900">{transfers.length}</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">In Transit</span>
                            <p className="text-2xl font-bold mt-1 text-amber-700">
                                {transfers.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'PENDING').length}
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Completed</span>
                            <p className="text-2xl font-bold mt-1 text-emerald-700">
                                {transfers.filter((t) => t.status === 'COMPLETED').length}
                            </p>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Cancelled</span>
                            <p className="text-2xl font-bold mt-1 text-emerald-700">
                                {transfers.filter((t) => t.status === 'CANCELLED').length}
                            </p>
                        </div>
                    </div>

                    {/* Interactive Client Table Component */}
                    <TransferTableClient initialTransfers={transfers as any} warehouses={warehouses} />
                </main>
            </div>
        </div>
    );
}