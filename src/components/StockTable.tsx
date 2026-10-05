// src/components/StockTable.tsx
'use client';

import { useState } from 'react';

type StockItem = {
    id: string;
    quantity: number;
    minThreshold: number;
    product: { name: string; sku: string; unitPrice: number };
    warehouse: { name: string; code: string };
};

type WarehouseOption = { id: string; name: string };

export default function StockTable({
                                       initialStock,
                                       warehouses,
                                   }: {
    initialStock: StockItem[];
    warehouses: WarehouseOption[];
}) {
    const [search, setSearch] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('all');

    const filteredStock = initialStock.filter((item) => {
        const matchesSearch =
            item.product.name.toLowerCase().includes(search.toLowerCase()) ||
            item.product.sku.toLowerCase().includes(search.toLowerCase());
        const matchesWarehouse =
            selectedWarehouse === 'all' || item.warehouse.name === selectedWarehouse;

        return matchesSearch && matchesWarehouse;
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-white">Product Stock Catalog</h2>
                    <p className="text-xs text-slate-400">Live quantity across active locations</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search SKU or Product..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Warehouses</option>
                        {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.name}>
                                {wh.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                    <tr>
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Warehouse</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">In Stock</th>
                        <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                    {filteredStock.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                                No stock items found matching criteria.
                            </td>
                        </tr>
                    ) : (
                        filteredStock.map((item) => {
                            const isLowStock = item.quantity <= item.minThreshold;
                            return (
                                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                                    <td className="py-3 px-4 font-medium text-white">{item.product.name}</td>
                                    <td className="py-3 px-4 font-mono text-xs text-indigo-400">{item.product.sku}</td>
                                    <td className="py-3 px-4 text-slate-400">{item.warehouse.name}</td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-200">
                                        ${item.product.unitPrice.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-white">{item.quantity}</td>
                                    <td className="py-3 px-4 text-center">
                      <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isLowStock
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                      >
                        {isLowStock ? 'Low Stock' : 'Optimal'}
                      </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}