// src/app/transfers/TransferTableClient.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { updateTransferStatusAction } from '@/app/actions/transfer';

type TransferItem = {
    id: string;
    quantity: number;
    status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
    notes?: string | null;
    createdAt: Date;
    product: { name: string; sku: string };
    sourceWarehouse?: { name: string; code: string } | null;
    targetWarehouse?: { name: string; code: string } | null;
    user?: { name: string | null; email: string } | null;
};

type WarehouseOption = { id: string; name: string; code: string };

export default function TransferTableClient({
                                                initialTransfers,
                                                warehouses,
                                            }: {
    initialTransfers: TransferItem[];
    warehouses: WarehouseOption[];
}) {
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
    const [search, setSearch] = useState<string>('');
    const [isPending, startTransition] = useTransition();

    const handleStatusUpdate = (movementId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
        startTransition(async () => {
            const res = await updateTransferStatusAction(movementId, newStatus);
            if (!res.success) {
                alert(res.error || 'Failed to update status');
            }
        });
    };

    const filteredTransfers = initialTransfers.filter((item) => {
        const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
        const matchesWarehouse =
            selectedWarehouse === 'ALL' ||
            item.sourceWarehouse?.code === selectedWarehouse ||
            item.targetWarehouse?.code === selectedWarehouse;
        const matchesSearch =
            item.product.name.toLowerCase().includes(search.toLowerCase()) ||
            item.product.sku.toLowerCase().includes(search.toLowerCase());

        return matchesStatus && matchesWarehouse && matchesSearch;
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            {/* Search & Multi-Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <input
                    type="text"
                    placeholder="Search product or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-64"
                />

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Facilities</option>
                        {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.code}>
                                {wh.name} ({wh.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Route</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {filteredTransfers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                No transfer orders found matching selected filters.
                            </td>
                        </tr>
                    ) : (
                        filteredTransfers.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/40">
                                <td className="py-3 px-4 text-slate-400">
                                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="py-3 px-4 font-medium text-white">
                                    {item.product.name}
                                    <span className="block font-mono text-[10px] text-indigo-400">{item.product.sku}</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-300">
                                    {item.sourceWarehouse?.code || 'EXT'} $\rightarrow$ {item.targetWarehouse?.code || 'EXT'}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-white">{item.quantity}</td>
                                <td className="py-3 px-4 text-center">
                    <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.status === 'IN_TRANSIT' || item.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                    >
                      {item.status}
                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    {(item.status === 'IN_TRANSIT' || item.status === 'PENDING') && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleStatusUpdate(item.id, 'COMPLETED')}
                                                className="px-2 py-1 text-[10px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded border border-emerald-500/30"
                                            >
                                                Mark Received
                                            </button>
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleStatusUpdate(item.id, 'CANCELLED')}
                                                className="px-2 py-1 text-[10px] font-semibold bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded border border-red-500/30"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}