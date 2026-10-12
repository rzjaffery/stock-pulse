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
        <aside className="w-64 bg-[#02100a] border-r border-emerald-950/80 flex flex-col fixed inset-y-0 left-0 z-30 shadow-2xl">
            {/* Brand Header */}
            <div className="p-6 border-b border-emerald-950/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                    S
                </div>
                <div>
                    <h2 className="font-extrabold text-white tracking-wider leading-none text-base">STOCKPULSE</h2>
                    <span className="text-[10px] text-emerald-400/80 font-semibold tracking-widest uppercase">Enterprise Elite</span>
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
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 border border-emerald-500/30'
                                    : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                            }`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Organization Status Footer */}
            <div className="p-4 border-t border-emerald-950/60">
                <div className="p-3 bg-[#03150d] border border-emerald-900/40 rounded-xl flex items-center justify-between shadow-inner">
                    <div>
                        <p className="text-xs font-bold text-slate-200">Global Operations</p>
                        <p className="text-[10px] text-emerald-400/70 font-mono">Tier-1 Secure</p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
                </div>
            </div>
        </aside>
    );
}