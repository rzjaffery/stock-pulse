// src/components/TransferModal.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { createTransferOrderAction } from '@/app/actions/transfer';

interface WarehouseOption {
    id: string;
    name: string;
    code: string;
}

interface ProductOption {
    id: string;
    name: string;
    sku: string;
}

interface UserOption {
    id: string;
    name: string;
}

interface TransferModalProps {
    warehouses: WarehouseOption[];
    products: ProductOption[];
    users: UserOption[];
    triggerButton?: React.ReactNode;
}

export default function TransferModal({
                                          warehouses,
                                          products,
                                          users,
                                          triggerButton,
                                      }: TransferModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        productId: products[0]?.id || '',
        sourceWarehouseId: warehouses[0]?.id || '',
        targetWarehouseId: warehouses[1]?.id || warehouses[0]?.id || '',
        quantity: 1,
        userId: users[0]?.id || '',
        notes: '',
        status: 'IN_TRANSIT' as 'PENDING' | 'IN_TRANSIT' | 'COMPLETED',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (formData.sourceWarehouseId === formData.targetWarehouseId) {
            setError('Source and target warehouses must be different.');
            return;
        }

        startTransition(async () => {
            const res = await createTransferOrderAction({
                productId: formData.productId,
                sourceWarehouseId: formData.sourceWarehouseId,
                targetWarehouseId: formData.targetWarehouseId,
                quantity: Number(formData.quantity),
                userId: formData.userId,
                notes: formData.notes,
                status: formData.status,
            });

            if (!res.success) {
                setError(res.error || 'Failed to create transfer order.');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    setFormData({
                        productId: products[0]?.id || '',
                        sourceWarehouseId: warehouses[0]?.id || '',
                        targetWarehouseId: warehouses[1]?.id || warehouses[0]?.id || '',
                        quantity: 1,
                        userId: users[0]?.id || '',
                        notes: '',
                        status: 'IN_TRANSIT',
                    });
                }, 1200);
            }
        });
    };

    return (
        <>
            {triggerButton ? (
                <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-700 rounded-lg hover:bg-emerald-800 text-white"
                >
                    + New Transfer Order
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 text-slate-700 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <h3 className="text-base font-bold text-slate-900">Create Inter-Warehouse Transfer</h3>
                            <button onClick={() => setIsOpen(false)} className="text-emerald-700 hover:text-slate-900">
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs">
                                Transfer order created and stock movements recorded!
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                    Select Product
                                </label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
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
                                    <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                        Source Warehouse
                                    </label>
                                    <select
                                        value={formData.sourceWarehouseId}
                                        onChange={(e) => setFormData({ ...formData, sourceWarehouseId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                        Destination Warehouse
                                    </label>
                                    <select
                                        value={formData.targetWarehouseId}
                                        onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                        Initial Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as 'PENDING' | 'IN_TRANSIT' | 'COMPLETED',
                                            })
                                        }
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                                    >
                                        <option value="IN_TRANSIT">In Transit</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="COMPLETED">Immediate Complete</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-emerald-700 mb-1">
                                    Notes / Shipment Order Ref
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Expedited air freight shipment"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-emerald-600 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-xs text-emerald-700 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50 text-white"
                                >
                                    {isPending ? 'Processing...' : 'Dispatch Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}