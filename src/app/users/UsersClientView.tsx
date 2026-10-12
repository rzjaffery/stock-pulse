// src/app/users/UsersClientView.tsx
'use client';

import React, { useState } from 'react';
import { updateUserRoleAction } from '@/app/actions/users';

interface UserItem {
    id: string;
    name: string | null;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
    createdAt: Date;
}

interface UsersClientViewProps {
    initialUsers: UserItem[];
    currentUserRole: string;
}

export default function UsersClientView({ initialUsers, currentUserRole }: UsersClientViewProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: any) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setLoadingId(userId);

        const res = await updateUserRoleAction(userId, newRole);
        setLoadingId(null);

        if (res.success) {
            setSuccessMsg('User role successfully updated.');
        } else {
            setErrorMsg(res.error || 'Failed to update role.');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        Administration
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Team & Permissions Management</h1>
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
                        {successMsg}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Organization Operators</h2>
                        <p className="text-xs text-slate-500">Manage access levels and operational permissions for your team members</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4">Operator Name</th>
                                <th className="py-3 px-4">Email Address</th>
                                <th className="py-3 px-4">Joined Date</th>
                                <th className="py-3 px-4">Access Role</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {initialUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/85 transition">
                                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                                        {u.name || 'Unnamed Operator'}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-emerald-700">{u.email}</td>
                                    <td className="py-3.5 px-4 text-slate-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        {currentUserRole === 'ADMIN' ? (
                                            <select
                                                value={u.role}
                                                disabled={loadingId === u.id}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 disabled:opacity-50 cursor-pointer"
                                            >
                                                <option value="ADMIN">ADMIN (Full Access)</option>
                                                <option value="MANAGER">MANAGER (Operations & Approvals)</option>
                                                <option value="OPERATOR">OPERATOR (View & Request)</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                                u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                    u.role === 'MANAGER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                    {u.role}
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}