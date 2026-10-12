// src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import ProfileModal from './ProfileModal';

interface SidebarProps {
    user?: {
        name?: string | null;
        email?: string | null;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard', href: '/', icon: '📊' },
        { label: 'Products Catalog', href: '/products', icon: '📦' },
        { label: 'Warehouses', href: '/warehouses', icon: '🏭' },
        { label: 'Transfers', href: '/transfers', icon: '🚚' },
        { label: 'Procurement', href: '/procurement', icon: '📋' },
        { label: 'Audit Trail', href: '/audit', icon: '🛡️' },
    ];

    return (
        <>
            <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-30 shadow-sm">
                {/* Brand Header */}
                <div className="p-5 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center font-bold text-white text-lg shadow-md font-serif">
                        S
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 tracking-wide text-sm font-serif">STOCKPULSE</h2>
                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Royal Emerald</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <span className="text-sm">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Profile Card Footer */}
                <div className="p-3 border-t border-slate-200 bg-white">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-2.5 text-left flex-1 hover:opacity-80 transition cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center font-serif shadow-sm">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Operator'}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Settings & Profile'}</p>
                            </div>
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            title="Sign Out"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            🚪
                        </button>
                    </div>
                </div>
            </aside>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={{
                    name: user?.name,
                    email: user?.email,
                    role: 'System Administrator',
                    organization: 'Royal Emerald Logistics',
                }}
            />
        </>
    );
}