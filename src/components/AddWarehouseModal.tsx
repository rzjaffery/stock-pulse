'use client';

import React, { useState, useTransition } from 'react';
import { CreateWarehouseAction } from '@/app/actions/warehouse';

interface AddWarehouseModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AddWarehouseModal({ isOpen: externalIsOpen, onClose }: AddWarehouseModalProps) {
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
        code: '',
        location: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const res = await CreateWarehouseAction({
                name: formData.name,
                code: formData.code,
                location: formData.location,
            });

            if (!res.success) {
                setError(res.error || 'Failed to create warehouse');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                    setSuccess(false);
                    setFormData({ name: '', code: '', location: '' });
                }, 1200);
            }
        });
    };

    return (
        <>
            {externalIsOpen === undefined && (
                <button
                    onClick={() => setInternalIsOpen(true)}
                    className="w-full flex items-center justify-start gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                    <span className="text-base">🏢</span> + Add Warehouse
                </button>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Add New Warehouse</h3>
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
                                Warehouse created successfully!
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                    Warehouse Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. East Coast Logistics Hub"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                        Warehouse Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="WH-EAST-02"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                                        Location / City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="New York, NY"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {isPending ? 'Saving...' : 'Create Warehouse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}