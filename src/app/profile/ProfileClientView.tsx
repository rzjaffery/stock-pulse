// src/app/profile/ProfileClientView.tsx
'use client';

import React, { useState } from 'react';
import { updateProfileDetailsAction, changePasswordAction } from '@/app/actions/profile';

interface ProfileClientViewProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        organizationName: string;
        organizationId: string;
    };
    auditCount: number;
    recentLogs: {
        id: string;
        action: string;
        details: string;
        createdAt: Date;
    }[];
}

export default function ProfileClientView({ user, auditCount, recentLogs }: ProfileClientViewProps) {
    const [name, setName] = useState(user.name);
    const [updatingDetails, setUpdatingDetails] = useState(false);
    const [detailsMsg, setDetailsMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    // Password change state
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [updatingPass, setUpdatingPass] = useState(false);
    const [passMsg, setPassMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setDetailsMsg(null);
        setUpdatingDetails(true);

        const res = await updateProfileDetailsAction({ name });
        setUpdatingDetails(false);

        if (res.success) {
            setDetailsMsg({ type: 'success', text: 'Profile details updated successfully.' });
        } else {
            setDetailsMsg({ type: 'error', text: res.error || 'Failed to update details.' });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg(null);

        if (newPass !== confirmPass) {
            setPassMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setUpdatingPass(true);
        const res = await changePasswordAction({ currentPass, newPass });
        setUpdatingPass(false);

        if (res.success) {
            setPassMsg({ type: 'success', text: 'Password changed successfully.' });
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
        } else {
            setPassMsg({ type: 'error', text: res.error || 'Failed to change password.' });
        }
    };

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        Account & Identity
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">User Settings & Profile</h1>
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-8 max-w-5xl">
                {/* Profile Overview Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{user.name || 'StockPulse User'}</h2>
                            <p className="text-xs font-mono text-slate-500">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                        user.role === 'MANAGER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                    {user.role} CLEARANCE
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full md:w-auto min-w-[240px]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Tenant Workspace
                        </span>
                        <p className="text-xs font-bold text-slate-900">{user.organizationName}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[200px]">
                            ID: {user.organizationId}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* General Information Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Personal Information</h3>
                            <p className="text-xs text-slate-500">Update your public display details</p>
                        </div>

                        <form onSubmit={handleUpdateDetails} className="space-y-4">
                            {detailsMsg && (
                                <div className={`p-3 text-xs rounded-xl font-medium ${
                                    detailsMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {detailsMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Email Address (Managed by Tenant)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={updatingDetails}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {updatingDetails ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Security & Password</h3>
                            <p className="text-xs text-slate-500">Update your access credentials</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {passMsg && (
                                <div className={`p-3 text-xs rounded-xl font-medium ${
                                    passMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {passMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={currentPass}
                                    onChange={(e) => setCurrentPass(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={updatingPass}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
                                >
                                    {updatingPass ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Operator Activity History */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">My System Activity</h3>
                            <p className="text-xs text-slate-500">
                                Total recorded operational actions: <span className="font-bold text-emerald-700">{auditCount}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center">No personal activity recorded yet.</p>
                        ) : (
                            recentLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                    <div>
                                        <span className="font-bold text-slate-900">{log.action}</span>
                                        <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(log.createdAt).toLocaleString()}
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