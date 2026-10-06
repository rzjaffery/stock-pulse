// src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: 'Overview', href: '/', icon: '📊' },
        { name: 'Analytics & BI', href: '/analytics', icon: '📈' },
        { name: 'Products Catalog', href: '/products', icon: '📦' },
        { name: 'Warehouses', href: '/warehouses', icon: '🏢' },
        { name: 'Transfer Orders', href: '/transfers', icon: '⇄' },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed top-4 left-4 z-40">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg shadow-md"
                >
                    {isOpen ? '✕' : '☰ Menu'}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="space-y-6">
                    {/* SaaS Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
                            S
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold text-white tracking-tight">StockPulse</h1>
                            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Enterprise SaaS</p>
                        </div>
                    </Link>

                    {/* Navigation Items */}
                    <nav className="space-y-1">
            <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Navigation
            </span>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg transition ${
                                        isActive
                                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                                >
                                    <span className="text-sm">{item.icon}</span> {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Tenant Footer */}
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate">Active Tenant Workspace</span>
                </div>
            </aside>
        </>
    );
}