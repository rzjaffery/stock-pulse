// src/app/transfers/TransfersClientView.tsx
'use client';

import React, { useState } from 'react';
import { transferStockAction } from '@/app/actions/transfer';

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    stockLevels: {
        id: string;
        warehouseId: string;
        quantity: number;
        warehouse: { name: string; code: string };
    }[];
}

interface TransferItem {
    id: string;
    quantity: number;
    createdAt: Date;
    notes?: string | null;
    product: { name: string; sku: string };
    sourceWarehouse?: { name: string; code: string } | null;
    targetWarehouse?: { name: string; code: string } | null;
}

interface TransfersClientViewProps {
    warehouses: Warehouse[];
    products: Product[];
    initialTransfers: TransferItem[];
}

export default function TransfersClientView({
                                                warehouses,
                                                products,
                                                initialTransfers,
                                            }: TransfersClientViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [sourceWarehouseId, setSourceWarehouseId] = useState('');
    const [targetWarehouseId, setTargetWarehouseId] = useState('');
    const [quantity, setQuantity] = useState<number>(10);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Find selected product to filter available source warehouses
    const selectedProduct = products.find((p) => p.id === productId);
    const availableSourceStocks = selectedProduct?.stockLevels || [];

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        const res = await transferStockAction({
            productId,
            sourceWarehouseId,
            targetWarehouseId,
            quantity,
            notes,
        });

        setLoading(false);

        if (res.success) {
            setIsModalOpen(false);
            setQuantity(10);
            setNotes('');
        } else {
            setErrorMsg(res.error || 'Transfer failed.');
        }
    };

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        Logistics
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Inter-Warehouse Transfers</h1>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                    🚚 Initiate Stock Transfer
                </button>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Transfer History Log</h2>
                        <p className="text-xs text-slate-500">Recent stock movements between distribution hubs</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4">Product / SKU</th>
                                <th className="py-3 px-4">Origin Hub</th>
                                <th className="py-3 px-4">Destination Hub</th>
                                <th className="py-3 px-4 text-center">Qty Moved</th>
                                <th className="py-3 px-4">Timestamp</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {initialTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                                        No stock transfers recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                initialTransfers.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-slate-900">{t.product.name}</p>
                                            <p className="font-mono text-[11px] text-emerald-700">{t.product.sku}</p>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">
                                            {t.sourceWarehouse?.name || 'External'} <span className="text-slate-400 font-mono text-[10px]">({t.sourceWarehouse?.code})</span>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">
                                            {t.targetWarehouse?.name || 'External'} <span className="text-slate-400 font-mono text-[10px]">({t.targetWarehouse?.code})</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-emerald-800">
                                            +{t.quantity}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                                            {new Date(t.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Transfer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold font-serif">Inter-Warehouse Transfer</h3>
                                <p className="text-xs text-emerald-200 mt-0.5">Move inventory safely between hubs</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-emerald-950/35 hover:bg-emerald-950/60 flex items-center justify-center text-emerald-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Select Product
                                </label>
                                <select
                                    value={productId}
                                    onChange={(e) => {
                                        setProductId(e.target.value);
                                        setSourceWarehouseId('');
                                    }}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Source Warehouse (Origin)
                                    </label>
                                    <select
                                        value={sourceWarehouseId}
                                        onChange={(e) => setSourceWarehouseId(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                    >
                                        <option value="">Select Origin...</option>
                                        {availableSourceStocks.map((s) => (
                                            <option key={s.warehouseId} value={s.warehouseId}>
                                                {s.warehouse.name} (Available: {s.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Destination Warehouse (Target)
                                    </label>
                                    <select
                                        value={targetWarehouseId}
                                        onChange={(e) => setTargetWarehouseId(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                    >
                                        <option value="">Select Destination...</option>
                                        {warehouses
                                            .filter((w) => w.id !== sourceWarehouseId)
                                            .map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.name} ({w.code})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Transfer Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Notes / Dispatch Reference (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Routine restocking batch #402"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
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
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Processing...' : 'Authorize Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}