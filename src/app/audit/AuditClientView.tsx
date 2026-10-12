// src/app/audit/AuditClientView.tsx
'use client';

import React, { useState } from 'react';

interface AuditLogItem {
    id: string;
    action: string;
    entity: string;
    details: string;
    metadata?: string | null;
    createdAt: Date;
    user?: { name: string | null; email: string } | null;
}

export default function AuditClientView({ initialLogs }: { initialLogs: AuditLogItem[] }) {
    const [search, setSearch] = useState('');
    const [selectedAction, setSelectedAction] = useState('ALL');

    const filteredLogs = initialLogs.filter((log) => {
        const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
        const matchesSearch =
            log.details.toLowerCase().includes(search.toLowerCase()) ||
            log.entity.toLowerCase().includes(search.toLowerCase());
        return matchesAction && matchesSearch;
    });

    const getBadgeColor = (action: string) => {
        if (action.includes('CREATED') || action.includes('ISSUED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (action.includes('COMPLETED') || action.includes('RECEIVED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (action.includes('CANCELLED')) return 'bg-red-500/10 text-red-700 border-red-500/20';
        return 'bg-amber-50 text-amber-700 border-amber-500/20';
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <input
                    type="text"
                    placeholder="Filter audit logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 w-full sm:w-64"
                />

                <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
                >
                    <option value="ALL">All Actions</option>
                    <option value="PRODUCT_CREATED">Product Created</option>
                    <option value="STOCK_ADJUSTED">Stock Adjusted</option>
                    <option value="BULK_IMPORTED">Bulk Imported</option>
                    <option value="TRANSFER_COMPLETED">Transfer Completed</option>
                    <option value="PO_RECEIVED">PO Received</option>
                </select>
            </div>

            {/* Timeline List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                {filteredLogs.length === 0 ? (
                    <p className="text-center text-xs text-emerald-700 py-8">No audit records found matching your query.</p>
                ) : (
                    <div className="relative border-l border-slate-200 ml-4 space-y-6 pl-6">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="relative group">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-50 border-2 border-emerald-500 group-hover:scale-125 transition" />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                                        <span className="text-xs font-bold text-slate-900">{log.entity}</span>
                                    </div>

                                    <span className="text-[11px] font-mono text-emerald-700">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                  </span>
                                </div>

                                <p className="text-xs text-slate-600 mt-1">{log.details}</p>

                                <div className="mt-2 text-[10px] text-emerald-700 flex items-center gap-3">
                                    <span>Operator: {log.user?.name || log.user?.email || 'System Automated'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}