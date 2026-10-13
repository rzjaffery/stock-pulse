// src/app/procurement/ProcurementClientView.tsx
'use client';

import React, { useState, useTransition } from 'react';
import {
    createSupplierAction,
    createPurchaseOrderAction,
    receivePurchaseOrderAction,
} from '@/app/actions/procurement';
import { Truck, AlertTriangle, FileText, Building2, Plus, Zap, X } from 'lucide-react';

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
        setPoForm({
            supplierId: suppliers[0]?.id || '',
            warehouseId: item ? item.warehouse.id : (warehouses[0]?.id || ''),
            productId: item ? item.product.id : (products[0]?.id || ''),
            quantityOrdered: item ? Math.max((item.minThreshold * 2) - item.quantity, 10) : 50,
            unitCost: item ? item.product.unitPrice : 10,
            notes: item ? `Reorder for ${item.product.name}` : '',
        });
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('LOW_STOCK')}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'LOW_STOCK'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Triggers ({lowStockItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('POS')}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'POS'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <FileText className={`w-4 h-4 ${activeTab === 'POS' ? 'text-white' : 'text-emerald-700'}`} /> Purchase Orders ({purchaseOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('SUPPLIERS')}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'SUPPLIERS'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <Building2 className={`w-4 h-4 ${activeTab === 'SUPPLIERS' ? 'text-white' : 'text-emerald-700'}`} /> Suppliers ({suppliers.length})
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <Building2 className="w-4 h-4 text-slate-500" /> Add Supplier
                    </button>
                    <button
                        onClick={() => handleOpenPoModal()}
                        disabled={suppliers.length === 0}
                        className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Issue Purchase Order
                    </button>
                </div>
            </div>

            {/* TAB 1: LOW STOCK TRIGGERS */}
            {activeTab === 'LOW_STOCK' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Reorder Point Threshold Alerts</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Items where current warehouse balance falls at or below configured minimum thresholds.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                            <tr>
                                <th className="py-3 px-4">Product</th>
                                <th className="py-3 px-4">Warehouse</th>
                                <th className="py-3 px-4 text-right">Current Balance</th>
                                <th className="py-3 px-4 text-right">Min Threshold</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                            {lowStockItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                                        All inventory levels are currently healthy and above minimum thresholds.
                                    </td>
                                </tr>
                            ) : (
                                lowStockItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                                            {item.product.name}
                                            <span className="block font-mono text-[11px] text-emerald-700">
                                                    {item.product.sku}
                                                </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">
                                            {item.warehouse.name} <span className="text-slate-400 font-mono text-[10px]">({item.warehouse.code})</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-medium">
                                            {item.minThreshold}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => handleOpenPoModal(item)}
                                                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-lg border border-emerald-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Zap className="w-3.5 h-3.5" /> Reorder Now
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: PURCHASE ORDERS */}
            {activeTab === 'POS' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Purchase Orders</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Manage inbound shipments and supplier procurement batches</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
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
                            <tbody className="divide-y divide-slate-200">
                            {purchaseOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                                        No purchase orders issued yet.
                                    </td>
                                </tr>
                            ) : (
                                purchaseOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{po.poNumber}</td>
                                        <td className="py-3.5 px-4 text-slate-900 font-semibold">{po.supplier.name}</td>
                                        <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{po.warehouse.code}</td>
                                        <td className="py-3.5 px-4">
                                            {po.items.map((it, idx) => (
                                                <div key={idx} className="font-medium text-slate-800">
                                                    {it.product.name} <span className="text-slate-400 font-mono">({it.quantityOrdered} units)</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                            ${po.totalCost.toFixed(2)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                                        po.status === 'RECEIVED'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {po.status}
                                                </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {po.status !== 'RECEIVED' && (
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleReceivePo(po.id)}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white rounded-lg border border-emerald-200 transition cursor-pointer disabled:opacity-50"
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
                </div>
            )}

            {/* TAB 3: SUPPLIERS */}
            {activeTab === 'SUPPLIERS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suppliers.length === 0 ? (
                        <div className="col-span-full bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-slate-500 text-xs">
                            No suppliers configured. Click <strong className="text-slate-900">+ Add Supplier</strong> to register vendors.
                        </div>
                    ) : (
                        suppliers.map((sup) => (
                            <div key={sup.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-3 hover:border-emerald-300 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                                        <p className="text-xs font-mono text-emerald-700 mt-0.5">{sup.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                                    {sup.phone && <p><span className="font-semibold text-slate-400">Phone:</span> {sup.phone}</p>}
                                    {sup.address && <p><span className="font-semibold text-slate-400">Address:</span> {sup.address}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MODAL: CREATE SUPPLIER */}
            {isSupplierModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold font-serif">Add Vendor / Supplier</h3>
                                <p className="text-xs text-emerald-200 mt-0.5">Register a new external supplier entity</p>
                            </div>
                            <button
                                onClick={() => setIsSupplierModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-emerald-950/35 hover:bg-emerald-950/60 flex items-center justify-center text-emerald-100 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Supplier Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Apex Logistics Corp"
                                    value={supplierForm.name}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Contact Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="orders@apexlogistics.com"
                                    value={supplierForm.email}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="+1 (555) 019-2834"
                                    value={supplierForm.phone}
                                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsSupplierModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition disabled:opacity-50 cursor-pointer"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold font-serif">Issue Purchase Order</h3>
                                <p className="text-xs text-emerald-200 mt-0.5">Procure inventory items from a registered supplier</p>
                            </div>
                            <button
                                onClick={() => setIsPoModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-emerald-950/35 hover:bg-emerald-950/60 flex items-center justify-center text-emerald-100 transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePo} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Supplier
                                </label>
                                <select
                                    value={poForm.supplierId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        setPoForm((prev) => ({ ...prev, supplierId: selectedId }));
                                    }}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                >
                                    <option value="" disabled>-- Select a Supplier --</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Product Item
                                </label>
                                <select
                                    value={poForm.productId}
                                    onChange={(e) => setPoForm({ ...poForm, productId: e.target.value })}
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
                                        Destination Warehouse
                                    </label>
                                    <select
                                        value={poForm.warehouseId}
                                        onChange={(e) => setPoForm({ ...poForm, warehouseId: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Quantity Ordered
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={poForm.quantityOrdered}
                                        onChange={(e) =>
                                            setPoForm({ ...poForm, quantityOrdered: Number(e.target.value) })
                                        }
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Unit Cost ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={poForm.unitCost}
                                    onChange={(e) => setPoForm({ ...poForm, unitCost: Number(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsPoModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-900/10 transition disabled:opacity-50 cursor-pointer"
                                >
                                    Issue Purchase Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}