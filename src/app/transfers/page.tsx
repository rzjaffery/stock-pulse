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
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              Logistics
            </span>
                        <h1 className="text-xl font-bold text-white tracking-tight mt-1">
                            Inter-Warehouse Transfer Orders
                        </h1>
                    </div>

                    <TransferModal
                        warehouses={warehouses}
                        products={products}
                        users={users}
                        triggerButton={
                            <button className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm flex items-center gap-2">
                                + Create Transfer Order
                            </button>
                        }
                    />
                </header>

                <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                    {/* Executive Overview KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Total Transfers</span>
                            <p className="text-2xl font-bold mt-1 text-white">{transfers.length}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">In Transit</span>
                            <p className="text-2xl font-bold mt-1 text-amber-400">
                                {transfers.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'PENDING').length}
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Completed</span>
                            <p className="text-2xl font-bold mt-1 text-emerald-400">
                                {transfers.filter((t) => t.status === 'COMPLETED').length}
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Cancelled</span>
                            <p className="text-2xl font-bold mt-1 text-slate-400">
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