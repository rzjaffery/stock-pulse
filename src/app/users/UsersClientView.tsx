// src/app/users/UsersClientView.tsx
'use client';

import React, { useState } from 'react';
import { updateUserRoleAction, createTeamMemberAction } from '@/app/actions/users';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // New member form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'MANAGER' | 'OPERATOR'>('OPERATOR');

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

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setSubmitting(true);

        const res = await createTeamMemberAction({ name, email, password, role });
        setSubmitting(false);

        if (res.success) {
            setIsModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            setRole('OPERATOR');
            setSuccessMsg('Team member created successfully.');
        } else {
            setErrorMsg(res.error || 'Failed to create team member.');
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

                {currentUserRole === 'ADMIN' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        + Add Team Member
                    </button>
                )}
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

            {/* Add Member Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold font-serif">Add New Team Member</h3>
                                <p className="text-xs text-emerald-200 mt-0.5">Provision an Operator or Manager account</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-emerald-950/35 hover:bg-emerald-950/60 flex items-center justify-center text-emerald-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Sarah Jenkins"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="sarah@enterprise.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Temporary Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Assign Role
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as any)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                >
                                    <option value="OPERATOR">OPERATOR (Standard View & Request)</option>
                                    <option value="MANAGER">MANAGER (Operations & Approvals)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}