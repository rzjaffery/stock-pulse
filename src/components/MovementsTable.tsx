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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Stock Movement History</h2>
                    <p className="text-xs text-emerald-700">Audit trail for transfers, additions, and adjustments</p>
                </div>

                {/* Movement Type Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-emerald-600"
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
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-emerald-700 uppercase text-xs border-b border-slate-200">
                    <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Source $\rightarrow$ Target</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4">Operator</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-emerald-700">
                                No stock movement history recorded yet.
                            </td>
                        </tr>
                    ) : (
                        filtered.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/40 transition">
                                <td className="py-3 px-4 text-xs text-emerald-700">
                                    {new Date(m.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-900">
                                    {m.product.name}
                                    <span className="block text-xs font-mono text-emerald-700">{m.product.sku}</span>
                                </td>
                                <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.type}
                    </span>
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-600">
                                    {m.sourceWarehouse?.code || 'External'} $\rightarrow$ {m.targetWarehouse?.code || 'External'}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900">{m.quantity}</td>
                                <td className="py-3 px-4 text-xs text-emerald-700">
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