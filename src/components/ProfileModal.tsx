// src/components/ProfileModal.tsx
'use client';

import React, { useState } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
        organization?: string;
    };
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'security' | 'organization'>('details');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header / Banner */}
                <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-950/30 hover:bg-emerald-950/50 flex items-center justify-center text-emerald-100 transition"
                    >
                        ✕
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white text-emerald-900 font-extrabold text-2xl flex items-center justify-center shadow-lg border-2 border-emerald-400/40 font-serif">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-serif tracking-tight">{user.name || 'Enterprise Operator'}</h2>
                            <p className="text-xs text-emerald-200 font-medium">{user.email || 'operator@stockpulse.com'}</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-700/60 border border-emerald-500/30 text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                {user.role || 'System Administrator'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-3 text-xs font-bold transition border-b-2 ${
                            activeTab === 'details'
                                ? 'border-emerald-700 text-emerald-800'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Account Details
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-3 text-xs font-bold transition border-b-2 ${
                            activeTab === 'security'
                                ? 'border-emerald-700 text-emerald-800'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Security & Session
                    </button>
                    <button
                        onClick={() => setActiveTab('organization')}
                        className={`pb-3 text-xs font-bold transition border-b-2 ${
                            activeTab === 'organization'
                                ? 'border-emerald-700 text-emerald-800'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Organization & Roles
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user.name || ''}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        defaultValue={user.email || ''}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Timezone Preference
                                </label>
                                <select className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600">
                                    <option>UTC (Coordinated Universal Time)</option>
                                    <option>EST (Eastern Standard Time)</option>
                                    <option>PKT (Pakistan Standard Time)</option>
                                    <option>GMT (Greenwich Mean Time)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-900">Active Authentication</h4>
                                    <p className="text-[11px] text-emerald-700">Protected by NextAuth Local Credentials & Password Hash</p>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-700 text-white font-bold text-[10px] rounded-lg">
                  SECURE
                </span>
                            </div>

                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-bold text-slate-700">Change Password</h4>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'organization' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                <p className="text-xs font-bold text-slate-700">Organization Name</p>
                                <p className="text-sm font-extrabold text-emerald-800 font-serif">
                                    {user.organization || 'Royal Emerald Logistics'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-700">Granted System Permissions</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Inventory Write', 'Transfer Authorization', 'Audit Trail Inspection', 'Procurement Admin'].map((perm) => (
                                        <span key={perm} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg">
                      ✓ {perm}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}