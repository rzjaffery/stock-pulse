// src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import AddProductModal from '@/components/AddProductModal';
import TransferModal from '@/components/TransferModal';
import AddWarehouseModal from '@/components/AddWarehouseModal';

interface Warehouse {
    id: string;
    name: string;
    code: string;
}
interface Product {
    id: string;
    name: string;
    sku: string;
}
interface User {
    id: string;
    name: string;
}

interface SidebarProps {
    warehouses: Warehouse[];
    products: Product[];
    users: User[];
}

export default function Sidebar({ warehouses, products, users }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

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

            {/* Overlay for Mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="space-y-6">
                    {/* SaaS Brand Logo */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
                            S
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold text-white tracking-tight">StockPulse</h1>
                            <p className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Enterprise SaaS</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
            <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Menu
            </span>
                        <a
                            href="/"
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                        >
                            <span>📊</span> Overview
                        </a>
                        <a
                            href="#catalog"
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
                        >
                            <span>📦</span> Products Catalog
                        </a>
                        <a
                            href="#movements"
                            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
                        >
                            <span>📋</span> Movement Audit Log
                        </a>
                    </nav>

                    {/* Quick Action Actions */}
                    <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Actions
            </span>

                        <AddProductModal warehouses={warehouses} />

                        <TransferModal
                            warehouses={warehouses}
                            products={products}
                            users={users}
                            triggerButton={
                                <button className="w-full flex items-center justify-start gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition">
                                    <span>⇄</span> Transfer Stock
                                </button>
                            }
                        />

                        <AddWarehouseModal />
                    </div>
                </div>

                {/* Footer Tenant Status */}
                <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate">Active Tenant Workspace</span>
                </div>
            </aside>
        </>
    );
}