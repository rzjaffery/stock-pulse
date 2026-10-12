// src/app/login/page.tsx
'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // or call a custom server action handling signIn

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        startTransition(async () => {
            try {
                const res = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (res?.error) {
                    setError(res.error);
                } else {
                    router.push('/');
                    router.refresh();
                }
            } catch (err: any) {
                setError(err.message || 'Failed to sign in.');
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md emerald-glass rounded-2xl p-8 border border-emerald-200 shadow-2xl space-y-6 relative z-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                        S
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">StockPulse</h1>
                    <p className="text-xs text-emerald-700/80 font-medium tracking-wide uppercase">
                        Royal Emerald Enterprise Access
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-xs p-3 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="operator@stockpulse.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Secure Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-700 hover:from-emerald-800 hover:to-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 border border-emerald-400/20 transition cursor-pointer"
                    >
                        {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="text-center pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-400">
                        Need an enterprise account?{' '}
                        <Link href="/signup" className="text-emerald-700 hover:text-slate-600 font-bold underline underline-offset-4">
                            Register Organization
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}