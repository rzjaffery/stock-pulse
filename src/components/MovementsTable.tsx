// src/components/MovementsTable.tsx
'use client';

import { useState } from 'react';

type MovementItem = {
    id: string;
    quantity: number;
    type: string;
    notes?: string | null;
    createdAt: Date;
    product: { name: string; sku: string };
    sourceWarehouse?: { name: string; code: string } | null;
    targetWarehouse?: { name: string; code: string } | null;
    user?: { name: string | null; email: string } | null;
};

export default function MovementsTable({ initialMovements }: { initialMovements: MovementItem[] }) {
    const [filterType, setFilterType] = useState('all');

    const filtered = initialMovements.filter(
        (m) => filterType === 'all' || m.type === filterType
    );

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">Stock Movement History</h2>
                    <p className="text-xs text-slate-400">Audit trail for transfers, additions, and adjustments</p>
                </div>

                {/* Movement Type Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">All Movement Types</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="INBOUND">Inbound</option>
                    <option value="OUTBOUND">Outbound</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                    <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Source $\rightarrow$ Target</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4">Operator</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                                No stock movement history recorded yet.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-800/40 transition">
                                <td className="py-3 px-4 text-xs text-slate-400">
                                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="py-3 px-4 font-medium text-white">
                                    {m.product.name}
                                    <span className="block text-xs font-mono text-slate-500">{m.product.sku}</span>
                                </td>
                                <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {m.type}
                    </span>
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-300">
                                    {m.sourceWarehouse?.code || 'External'} $\rightarrow$ {m.targetWarehouse?.code || 'External'}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-white">{m.quantity}</td>
                                <td className="py-3 px-4 text-xs text-slate-400">
                                    {m.user?.name || m.user?.email || 'System Admin'}
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