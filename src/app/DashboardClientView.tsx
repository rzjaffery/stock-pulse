// src/app/DashboardClientView.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    ArrowRightLeft,
    Box,
    Boxes,
    LayoutArrowDown,
    ShieldHalf,
    SquareChartGantt,
    Wallet,
    Warehouse
} from "lucide-react";

interface DashboardClientViewProps {
    metrics: {
        totalValuation: number;
        totalSkus: number;
        lowStockCount: number;
        warehouseCount: number;
    },
    recentLogs: {
        id: string;
        action: string;
        details: string;
        createdAt: Date;
        user?: { name: string | null } | null;
    }[],
    userName?: string | null,
    lowStockSection?: React.JSX.Element
}

export default function DashboardClientView({
                                                metrics,
                                                recentLogs,
                                                userName,
                                                lowStockSection
                                            }: DashboardClientViewProps) {
    return (
        <>
            {/* Header */}
            <header
                className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
          <span
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
            Command Center
          </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                        Welcome back, {userName || 'Operator'}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/products"
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2"
                    >
                        <SquareChartGantt size={20} strokeWidth={1.75}  /> Manage Products
                    </Link>
                    <Link
                        href="/transfers"
                        className="px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition flex items-center gap-2"
                    >
                        <ArrowRightLeft size={20} strokeWidth={1.75} /> Stock Transfers
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 md:p-8 space-y-8 max-w-7xl">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Valuation */}
                    <div
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory Valuation</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm"><Wallet size={20} strokeWidth={1.75} /></span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                                Rs {metrics.totalValuation.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            </h3>
                            <p className="text-[11px] text-emerald-700 font-medium mt-1">Total value across all
                                warehouses</p>
                        </div>
                    </div>

                    {/* Active SKUs */}
                    <div
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span
                                className="text-xs font-bold uppercase tracking-wider text-slate-500">Active SKUs</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm"><Boxes size={20} strokeWidth={1.75} /></span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                                {metrics.totalSkus.toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-emerald-700 font-medium mt-1">Unique catalog items</p>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span
                                className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Alerts</span>
                            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 text-sm"><LayoutArrowDown size={20} strokeWidth={1.75} /></span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                                {metrics.lowStockCount}
                            </h3>
                            <p className="text-[11px] text-amber-700 font-medium mt-1">Items at or below threshold</p>
                        </div>
                    </div>

                    {/* Active Warehouses */}
                    <div
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Warehouses</span>
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm"><Warehouse size={20} strokeWidth={1.75} /></span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                                {metrics.warehouseCount}
                            </h3>
                            <p className="text-[11px] text-emerald-700 font-medium mt-1">Operational distribution
                                hubs</p>
                        </div>
                    </div>
                </div>

                {/* Recent Audit Activity Feed */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Live Audit &
                                Activity Trail</h2>
                            <p className="text-xs text-slate-500">Recent operational logs across your organization</p>
                        </div>
                        <Link href="/audit" className="text-xs font-bold text-emerald-700 hover:underline">
                            View Full Audit Trail
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentLogs.length === 0 ? (
                            <p className="text-center py-8 text-xs text-slate-500 font-medium">
                                No recent activity recorded yet. Start by creating products or transfers.
                            </p>
                        ) : (
                            recentLogs.map((log) => (
                                <div key={log.id}
                                     className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition">
                                    <div className="flex items-center gap-3">
                    <span
                        className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      <ShieldHalf size={20} strokeWidth={1.75} />
                    </span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">{log.action}</span>
                                                <span
                                                    className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {log.user?.name || 'System Operator'}
                        </span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}