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
    stockLevels: {
        quantity: number;
        minThreshold: number;
        warehouse: { name: string; code: string };
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
            <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            Catalog
          </span>
                    <h1 className="text-xl font-bold text-white tracking-tight mt-1">Products Catalog</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-2"
                    >
                        📊 Bulk Import (CSV)
                    </button>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2"
                    >
                        + Add Single Product
                    </button>
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full max-w-md"
                    />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                            <tr>
                                <th className="py-3.5 px-4">Product Name</th>
                                <th className="py-3.5 px-4">SKU</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4 text-right">Unit Price</th>
                                <th className="py-3.5 px-4 text-right">Total Stock</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => {
                                    const totalStock = p.stockLevels.reduce((acc, s) => acc + s.quantity, 0);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-800/40">
                                            <td className="py-3.5 px-4 font-medium text-white">{p.name}</td>
                                            <td className="py-3.5 px-4 font-mono text-indigo-400">{p.sku}</td>
                                            <td className="py-3.5 px-4 text-slate-400">{p.category?.name || 'General'}</td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">
                                                ${p.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-white">
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