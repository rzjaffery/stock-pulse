// src/components/LowStockSection.tsx
'use client';

import React, { useState } from 'react';
import { quickRestockAction } from '@/app/actions/restock';
import {AlertTriangle, CheckCircle2, X, Zap} from "lucide-react";

interface StockItem {
    id: string;
    quantity: number;
    minThreshold: number;
    product: {
        id: string;
        name: string;
        sku: string;
        unitPrice: number;
    };
    warehouse: {
        id: string;
        name: string;
        code: string;
    };
}

interface LowStockSectionProps {
    lowStockItems: StockItem[];
}

export default function LowStockSection({ lowStockItems }: LowStockSectionProps) {
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [restockQty, setRestockQty] = useState<number>(50);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        setLoading(true);
        setErrorMsg(null);

        const res = await quickRestockAction(selectedItem.id, restockQty);
        setLoading(false);

        if (res.success) {
            setSelectedItem(null);
            setRestockQty(50);
        } else {
            setErrorMsg(res.error || 'Restock failed');
        }
    };

    if (lowStockItems.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Inventory Health Optimal</h2>
                        <p className="text-xs text-slate-500">All warehouse stock levels are currently above their safety thresholds.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Low Stock & Reorder Alerts</h2>
                        <p className="text-xs text-slate-500">{lowStockItems.length} SKU stock levels require immediate replenishment</p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                        <th className="py-3 px-4">Product / SKU</th>
                        <th className="py-3 px-4">Warehouse Hub</th>
                        <th className="py-3 px-4 text-center">Current Qty</th>
                        <th className="py-3 px-4 text-center">Min Threshold</th>
                        <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                    {lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/20 transition">
                            <td className="py-3 px-4">
                                <p className="font-semibold text-slate-900">{item.product.name}</p>
                                <p className="font-mono text-[11px] text-emerald-700">{item.product.sku}</p>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-700">
                                {item.warehouse.name} <span className="text-slate-400 font-mono text-[10px]">({item.warehouse.code})</span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-amber-700">
                                {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-slate-500">
                                {item.minThreshold}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition text-xs cursor-pointer"
                                >
                                    <Zap className="w-3.5 h-3.5" /> Quick Restock
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Restock Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold font-serif">Restock Inventory SKU</h3>
                                <p className="text-xs text-emerald-200 font-mono mt-0.5">{selectedItem.product.sku}</p>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="w-8 h-8 rounded-full bg-emerald-950/30 hover:bg-emerald-950/50 flex items-center justify-center text-emerald-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRestockSubmit} className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedItem.product.name}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Target Warehouse
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    value={`${selectedItem.warehouse.name} (${selectedItem.warehouse.code})`}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Quantity to Add (Inbound Shipment)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}