// src/app/products/ProductsClientView.tsx
'use client';

import React, { useState } from 'react';
import AddProductModal from '@/components/AddProductModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import { bulkImportProductsAction } from '@/app/actions/bulk';

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    description?: string | null;
    unitPrice: number;
    category?: { name: string } | null;
    stockLevels?: {
        quantity: number;
        minThreshold: number;
        warehouse?: { name: string; code: string };
    }[];
}

interface ProductsClientViewProps {
    initialProducts: Product[];
    warehouses: Warehouse[];
}

export default function ProductsClientView({
                                               initialProducts,
                                               warehouses,
                                           }: ProductsClientViewProps) {
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    const sampleProductsCsv = `name,sku,description,unitPrice,warehouseId,initialQuantity,minThreshold
Ergonomic Mechanical Keyboard,KB-MECH-01,RGB Backlit Gaming Keyboard,89.99,WH-NORTH,150,15
Wireless Optical Mouse,MS-WIRE-02,2.4GHz Ergonomic Mouse,24.50,WH-NORTH,200,20`;

    const filteredProducts = initialProducts.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Catalog
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Products Catalog</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                        📊 Bulk Import (CSV)
                    </button>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                        + Add Single Product
                    </button>
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-full max-w-md transition"
                    />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-emerald-800 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-3.5 px-4">Product Name</th>
                                <th className="py-3.5 px-4">SKU</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4 text-right">Unit Price</th>
                                <th className="py-3.5 px-4 text-right">Total Stock</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => {
                                    const totalStock = (p.stockLevels || []).reduce(
                                        (acc, s) => acc + (s.quantity || 0),
                                        0
                                    );
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                                            <td className="py-3.5 px-4 font-mono font-medium text-emerald-700">{p.sku}</td>
                                            <td className="py-3.5 px-4 text-slate-600">{p.category?.name || 'General Inventory'}</td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                                                ${p.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                                                {totalStock.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AddProductModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                warehouses={warehouses}
            />

            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Import Products via CSV"
                templateCsv={sampleProductsCsv}
                templateFileName="products_import_template.csv"
                onUpload={bulkImportProductsAction}
            />
        </>
    );
}