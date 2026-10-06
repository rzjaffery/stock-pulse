'use client';

import React, { useState, useTransition } from 'react';
import { createProductAction } from '@/app/actions/product';

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface AddProductModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    warehouses: Warehouse[];
}

export default function AddProductModal({ isOpen: externalIsOpen, onClose, warehouses }: AddProductModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Controlled or uncontrolled fallback
    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        unitPrice: 10,
        warehouseId: warehouses[0]?.id || '',
        initialQuantity: 50,
        minThreshold: 10,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const res = await createProductAction({
                name: formData.name,
                sku: formData.sku,
                description: formData.description,
                unitPrice: Number(formData.unitPrice),
                warehouseId: formData.warehouseId,
                initialQuantity: Number(formData.initialQuantity),
                minThreshold: Number(formData.minThreshold),
            });

            if (!res.success) {
                setError(res.error || 'Failed to create product');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                    setSuccess(false);
                    setFormData({
                        name: '',
                        sku: '',
                        description: '',
                        unitPrice: 10,
                        warehouseId: warehouses[0]?.id || '',
                        initialQuantity: 50,
                        minThreshold: 10,
                    });
                }, 1200);
            }
        });
    };

    return (
        <>
            {externalIsOpen === undefined && (
                <button
                    onClick={() => setInternalIsOpen(true)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition shadow-sm"
                >
                    + Add New Product
                </button>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Add New Product to Catalog</h3>
                            <button onClick={handleClose} className="text-slate-400 hover:text-slate-200">
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 rounded text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded text-sm">
                                Product created and stock allocated!
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Wireless Ergonomic Mouse"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">SKU Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ELEC-MSE-01"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Warehouse</label>
                                {warehouses.length === 0 ? (
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-amber-400">
                                        ⚠️ No warehouse found. A <strong>&#34;Main Distribution Hub&#34;</strong> will be created automatically.
                                    </div>
                                ) : (
                                    <select
                                        value={formData.warehouseId}
                                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Initial Qty</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.initialQuantity}
                                        onChange={(e) => setFormData({ ...formData, initialQuantity: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Min Threshold</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.minThreshold}
                                        onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {isPending ? 'Saving...' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}