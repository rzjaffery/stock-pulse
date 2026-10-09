// src/components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Dashboard', href: '/', icon: '📊' },
        { label: 'Products Catalog', href: '/products', icon: '📦' },
        { label: 'Warehouses', href: '/warehouses', icon: '🏭' },
        { label: 'Transfers', href: '/transfers', icon: '🚚' },
        { label: 'Procurement', href: '/procurement', icon: '📋' },
        { label: 'Analytics', href: '/analytics', icon: '📈' },
        { label: 'Audit Trail', href: '/audit', icon: '🛡️' },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30">
            {/* Brand Header */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
                    S
                </div>
                <div>
                    <h2 className="font-bold text-white tracking-tight leading-none text-base">StockPulse</h2>
                    <span className="text-[10px] text-slate-400 font-medium">Enterprise Inventory</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User / Organization Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-200">Main Organization</p>
                        <p className="text-[10px] text-slate-500 font-mono">Org ID: active-tenant</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
            </div>
        </aside>
    );
}