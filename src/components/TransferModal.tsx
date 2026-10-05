// src/components/TransferModal.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { transferStockAction } from '@/app/actions/inventory';

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
interface TransferModalProps {
    warehouses: Warehouse[];
    products: Product[];
    users: User[];
    triggerButton?: React.ReactNode;
}

export default function TransferModal({ warehouses, products, users, triggerButton }: TransferModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        productId: products[0]?.id || '',
        sourceWarehouseId: warehouses[0]?.id || '',
        targetWarehouseId: warehouses[1]?.id || '',
        quantity: 1,
        userId: users[0]?.id || '',
        notes: '',
    });

    const hasMultipleWarehouses = warehouses.length >= 2;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasMultipleWarehouses) return;

        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await transferStockAction({
                productId: formData.productId,
                sourceWarehouseId: formData.sourceWarehouseId,
                targetWarehouseId: formData.targetWarehouseId,
                quantity: Number(formData.quantity),
                userId: formData.userId,
                notes: formData.notes,
            });

            if (!result.success) {
                setError(result.error || 'Transfer failed');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                }, 1500);
            }
        });
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {triggerButton || (
                    <button className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition shadow-sm">
                        ⇄ Transfer Stock
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Inter-Warehouse Transfer</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
                                ✕
                            </button>
                        </div>

                        {!hasMultipleWarehouses ? (
                            <div className="space-y-4 py-3">
                                <div className="p-4 bg-amber-950/60 border border-amber-800 text-amber-200 rounded-lg text-sm space-y-2">
                                    <p className="font-semibold text-amber-300">⚠️ Minimum 2 Warehouses Required</p>
                                    <p className="text-xs">
                                        You currently have <strong>{warehouses.length}</strong> warehouse registered. To transfer stock between locations, please add at least one more warehouse from the sidebar.
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded text-sm">
                                        Transfer completed successfully! Database updated.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                            Product
                                        </label>
                                        <select
                                            value={formData.productId}
                                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.sku})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                                From (Source)
                                            </label>
                                            <select
                                                value={formData.sourceWarehouseId}
                                                onChange={(e) => setFormData({ ...formData, sourceWarehouseId: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {warehouses.map((w) => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                                To (Target)
                                            </label>
                                            <select
                                                value={formData.targetWarehouseId}
                                                onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {warehouses.map((w) => (
                                                    <option key={w.id} value={w.id}>
                                                        {w.code}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                                Operator
                                            </label>
                                            <select
                                                value={formData.userId}
                                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {users.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                            Notes
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Optional movement notes..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isPending}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            {isPending ? 'Executing Transaction...' : 'Confirm Transfer'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}