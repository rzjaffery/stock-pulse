// src/app/procurement/ProcurementClientView.tsx
'use client';

import React, { useState, useTransition } from 'react';
import {
    createSupplierAction,
    createPurchaseOrderAction,
    receivePurchaseOrderAction,
} from '@/app/actions/procurement';

interface Supplier {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    totalCost: number;
    createdAt: Date;
    supplier: { name: string };
    warehouse: { code: string };
    items: {
        quantityOrdered: number;
        unitCost: number;
        product: { name: string; sku: string };
    }[];
}

interface LowStockItem {
    id: string;
    quantity: number;
    minThreshold: number;
    product: { id: string; name: string; sku: string; unitPrice: number };
    warehouse: { id: string; name: string; code: string };
}

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    unitPrice: number;
}

interface ProcurementClientViewProps {
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    lowStockItems: LowStockItem[];
    warehouses: Warehouse[];
    products: Product[];
}

export default function ProcurementClientView({
                                                  suppliers,
                                                  purchaseOrders,
                                                  lowStockItems,
                                                  warehouses,
                                                  products,
                                              }: ProcurementClientViewProps) {
    const [activeTab, setActiveTab] = useState<'LOW_STOCK' | 'POS' | 'SUPPLIERS'>('LOW_STOCK');
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isPoModalOpen, setIsPoModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Selected item for auto-filling PO modal from Low Stock trigger
    const [prefilledPo, setPrefilledPo] = useState<{
        productId: string;
        warehouseId: string;
        suggestedQty: number;
        unitCost: number;
    } | null>(null);

    // Supplier Form State
    const [supplierForm, setSupplierForm] = useState({ name: '', email: '', phone: '', address: '' });

    // PO Form State
    const [poForm, setPoForm] = useState({
        supplierId: suppliers[0]?.id || '',
        warehouseId: warehouses[0]?.id || '',
        productId: products[0]?.id || '',
        quantityOrdered: 50,
        unitCost: 10,
        notes: '',
    });

    const handleOpenPoModal = (item?: LowStockItem) => {
        if (item) {
            const deficit = Math.max(item.minThreshold * 2 - item.quantity, 10);
            setPoForm((prev) => ({
                ...prev,
                productId: item.product.id,
                warehouseId: item.warehouse.id,
                quantityOrdered: deficit,
                unitCost: item.product.unitPrice,
            }));
        }
        setIsPoModalOpen(true);
    };

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await createSupplierAction(supplierForm);
            if (res.success) {
                setIsSupplierModalOpen(false);
                setSupplierForm({ name: '', email: '', phone: '', address: '' });
            } else {
                alert(res.error || 'Failed to add supplier');
            }
        });
    };

    const handleCreatePo = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await createPurchaseOrderAction({
                supplierId: poForm.supplierId,
                warehouseId: poForm.warehouseId,
                productId: poForm.productId,
                quantityOrdered: Number(poForm.quantityOrdered),
                unitCost: Number(poForm.unitCost),
                notes: poForm.notes,
            });
            if (res.success) {
                setIsPoModalOpen(false);
            } else {
                alert(res.error || 'Failed to issue PO');
            }
        });
    };

    const handleReceivePo = (poId: string) => {
        startTransition(async () => {
            const res = await receivePurchaseOrderAction(poId);
            if (!res.success) {
                alert(res.error || 'Failed to receive PO stock');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => setActiveTab('LOW_STOCK')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            activeTab === 'LOW_STOCK'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        ⚠️ Low Stock Triggers ({lowStockItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('POS')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            activeTab === 'POS'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        📋 Purchase Orders ({purchaseOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('SUPPLIERS')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                            activeTab === 'SUPPLIERS'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        🏢 Suppliers ({suppliers.length})
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg"
                    >
                        + Add Supplier
                    </button>
                    <button
                        onClick={() => handleOpenPoModal()}
                        disabled={suppliers.length === 0}
                        className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg"
                    >
                        + Issue Purchase Order
                    </button>
                </div>
            </div>

            {/* TAB 1: LOW STOCK TRIGGERS */}
            {activeTab === 'LOW_STOCK' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <h2 className="text-sm font-bold text-white">Reorder Point Threshold Alerts</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Items where current warehouse balance falls at or below configured minimum thresholds.
                        </p>
                    </div>

                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Warehouse</th>
                            <th className="py-3 px-4 text-right">Current Balance</th>
                            <th className="py-3 px-4 text-right">Min Threshold</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                        {lowStockItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500">
                                    All inventory levels are currently healthy and above minimum thresholds.
                                </td>
                            </tr>
                        ) : (
                            lowStockItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/40">
                                    <td className="py-3 px-4 font-medium text-white">
                                        {item.product.name}
                                        <span className="block font-mono text-[10px] text-indigo-400">
                        {item.product.sku}
                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-slate-300">
                                        {item.warehouse.name} ({item.warehouse.code})
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-amber-400">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                                        {item.minThreshold}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleOpenPoModal(item)}
                                            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded border border-indigo-500/30"
                                        >
                                            ⚡ Reorder Now
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: PURCHASE ORDERS */}
            {activeTab === 'POS' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                            <th className="py-3 px-4">PO Number</th>
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">Destination</th>
                            <th className="py-3 px-4">Product Items</th>
                            <th className="py-3 px-4 text-right">Total Cost</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                        {purchaseOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-500">
                                    No purchase orders issued yet.
                                </td>
                            </tr>
                        ) : (
                            purchaseOrders.map((po) => (
                                <tr key={po.id} className="hover:bg-slate-800/40">
                                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{po.poNumber}</td>
                                    <td className="py-3 px-4 text-white font-medium">{po.supplier.name}</td>
                                    <td className="py-3 px-4 font-mono text-slate-300">{po.warehouse.code}</td>
                                    <td className="py-3 px-4">
                                        {po.items.map((it, idx) => (
                                            <div key={idx}>
                                                {it.product.name} ({it.quantityOrdered} units)
                                            </div>
                                        ))}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                                        ${po.totalCost.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                      <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              po.status === 'RECEIVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                      >
                        {po.status}
                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {po.status !== 'RECEIVED' && (
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleReceivePo(po.id)}
                                                className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white rounded border border-emerald-500/30"
                                            >
                                                Receive Shipment
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: SUPPLIERS */}
            {activeTab === 'SUPPLIERS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suppliers.length === 0 ? (
                        <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                            No suppliers configured. Click <strong>+ Add Supplier</strong> to register vendors.
                        </div>
                    ) : (
                        suppliers.map((sup) => (
                            <div key={sup.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                                <h3 className="font-bold text-white text-sm">{sup.name}</h3>
                                <p className="text-xs text-indigo-400 font-mono">{sup.email}</p>
                                {sup.phone && <p className="text-xs text-slate-400">{sup.phone}</p>}
                                {sup.address && <p className="text-xs text-slate-500 italic">{sup.address}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MODAL: CREATE SUPPLIER */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Add Vendor / Supplier</h3>
                        <form onSubmit={handleCreateSupplier} className="space-y-3">
                            <input
                                type="text"
                                required
                                placeholder="Supplier Company Name"
                                value={supplierForm.name}
                                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                            />
                            <input
                                type="email"
                                required
                                placeholder="Contact Email Address"
                                value={supplierForm.email}
                                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                            />
                            <input
                                type="text"
                                placeholder="Phone Number (Optional)"
                                value={supplierForm.phone}
                                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSupplierModalOpen(false)}
                                    className="px-3 py-1.5 text-xs text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg"
                                >
                                    Save Supplier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CREATE PURCHASE ORDER */}
            {isPoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Issue Purchase Order</h3>
                        <form onSubmit={handleCreatePo} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    Supplier
                                </label>
                                <select
                                    value={poForm.supplierId}
                                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                                >
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    Product
                                </label>
                                <select
                                    value={poForm.productId}
                                    onChange={(e) => setPoForm({ ...poForm, productId: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
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
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                        Destination Warehouse
                                    </label>
                                    <select
                                        value={poForm.warehouseId}
                                        onChange={(e) => setPoForm({ ...poForm, warehouseId: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                        Quantity Ordered
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={poForm.quantityOrdered}
                                        onChange={(e) =>
                                            setPoForm({ ...poForm, quantityOrdered: Number(e.target.value) })
                                        }
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                                    Unit Cost ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={poForm.unitCost}
                                    onChange={(e) => setPoForm({ ...poForm, unitCost: Number(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPoModalOpen(false)}
                                    className="px-3 py-1.5 text-xs text-slate-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg"
                                >
                                    Issue PO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}