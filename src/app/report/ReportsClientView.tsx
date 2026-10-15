// src/app/reports/ReportsClientView.tsx
'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Printer, Package, Truck, ShoppingCart, ShieldCheck } from 'lucide-react';

interface ReportsClientViewProps {
    products: any[];
    transfers: any[];
    purchaseOrders: any[];
    auditLogs: any[];
}

export default function ReportsClientView({
                                              products,
                                              transfers,
                                              purchaseOrders,
                                              auditLogs,
                                          }: ReportsClientViewProps) {
    const [activeTab, setActiveTab] = useState<'INVENTORY' | 'TRANSFERS' | 'PROCUREMENT' | 'AUDIT'>('INVENTORY');

    // Helper: Export JavaScript array to CSV file
    const downloadCSV = (filename: string, rows: object[]) => {
        if (!rows || rows.length === 0) return;

        const headers = Object.keys(rows[0]);
        const csvContent = [
            headers.join(','),
            ...rows.map((row) =>
                headers
                    .map((header) => {
                        const val = (row as any)[header];
                        const escaped = String(val ?? '').replace(/"/g, '""');
                        return `"${escaped}"`;
                    })
                    .join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Handlers
    const handleExportInventoryCSV = () => {
        const formatted = products.flatMap((p) =>
            p.stockLevels.map((s: any) => ({
                SKU: p.sku,
                ProductName: p.name,
                Warehouse: s.warehouse.name,
                WarehouseCode: s.warehouse.code,
                Quantity: s.quantity,
                MinThreshold: s.minThreshold,
                UnitPrice: p.unitPrice,
                TotalValuation: (s.quantity * p.unitPrice).toFixed(2),
            }))
        );
        downloadCSV('StockPulse_Inventory_Valuation', formatted);
    };

    const handleExportTransfersCSV = () => {
        const formatted = transfers.map((t) => ({
            TransferID: t.id,
            Product: t.product?.name,
            SKU: t.product?.sku,
            OriginHub: t.sourceWarehouse?.name || 'External',
            DestinationHub: t.targetWarehouse?.name || 'External',
            QuantityMoved: t.quantity,
            Timestamp: new Date(t.createdAt).toLocaleString(),
            Notes: t.notes || '',
        }));
        downloadCSV('StockPulse_Transfer_Logs', formatted);
    };

    const handleExportProcurementCSV = () => {
        const formatted = purchaseOrders.map((po) => ({
            PONumber: po.poNumber,
            Supplier: po.supplier?.name,
            Warehouse: po.warehouse?.name,
            Status: po.status,
            TotalCost: po.totalCost,
            IssuedDate: new Date(po.createdAt).toLocaleDateString(),
        }));
        downloadCSV('StockPulse_Procurement_Report', formatted);
    };

    const handleExportAuditCSV = () => {
        const formatted = auditLogs.map((log) => ({
            LogID: log.id,
            UserEmail: log.user?.email || 'System',
            UserRole: log.user?.role || 'SYSTEM',
            Action: log.action,
            Entity: log.entity,
            Details: log.details,
            Timestamp: new Date(log.createdAt).toLocaleString(),
        }));
        downloadCSV('StockPulse_Compliance_Audit_Trail', formatted);
    };

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        Executive Intelligence
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">Reports & Export Center</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-slate-500" /> Print Summary
                    </button>

                    {activeTab === 'INVENTORY' && (
                        <button
                            onClick={handleExportInventoryCSV}
                            className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Export Inventory CSV
                        </button>
                    )}
                    {activeTab === 'TRANSFERS' && (
                        <button
                            onClick={handleExportTransfersCSV}
                            className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Export Transfers CSV
                        </button>
                    )}
                    {activeTab === 'PROCUREMENT' && (
                        <button
                            onClick={handleExportProcurementCSV}
                            className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Export Procurement CSV
                        </button>
                    )}
                    {activeTab === 'AUDIT' && (
                        <button
                            onClick={handleExportAuditCSV}
                            className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Export Audit Trail CSV
                        </button>
                    )}
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                {/* Printable Header Notice */}
                <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900">StockPulse Enterprise Audit Summary</h1>
                    <p className="text-xs text-slate-500">Generated on {new Date().toLocaleString()}</p>
                </div>

                {/* Tab Controls */}
                <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm print:hidden">
                    <button
                        onClick={() => setActiveTab('INVENTORY')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'INVENTORY'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <Package className="w-4 h-4" /> Stock Valuation ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('TRANSFERS')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'TRANSFERS'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <Truck className="w-4 h-4" /> Stock Movements ({transfers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('PROCUREMENT')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'PROCUREMENT'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4" /> Purchase Orders ({purchaseOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('AUDIT')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'AUDIT'
                                ? 'bg-emerald-700 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Audit Log ({auditLogs.length})
                    </button>
                </div>

                {/* TAB 1: INVENTORY VALUATION */}
                {activeTab === 'INVENTORY' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 print:hidden">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Inventory Stock & Valuation Report</h2>
                            <p className="text-xs text-slate-500">Live snapshot of physical stock levels across all distribution centers</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">SKU / Product</th>
                                    <th className="py-3 px-4">Warehouse</th>
                                    <th className="py-3 px-4 text-center">Available Qty</th>
                                    <th className="py-3 px-4 text-right">Unit Price</th>
                                    <th className="py-3 px-4 text-right">Total Stock Value</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {products.flatMap((p) =>
                                    p.stockLevels.map((s: any) => (
                                        <tr key={`${p.id}-${s.id}`} className="hover:bg-slate-50/85 transition">
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-slate-900">{p.name}</p>
                                                <p className="font-mono text-[11px] text-emerald-700">{p.sku}</p>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-700">
                                                {s.warehouse.name} <span className="text-slate-400 font-mono text-[10px]">({s.warehouse.code})</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                                {s.quantity}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                                                Rs {p.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-emerald-800">
                                                Rs {(s.quantity * p.unitPrice).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: TRANSFERS REPORT */}
                {activeTab === 'TRANSFERS' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 print:hidden">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Inter-Warehouse Movement Log</h2>
                            <p className="text-xs text-slate-500">Historical transfer activity between organizational hubs</p>
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
                                {transfers.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-slate-900">{t.product?.name}</p>
                                            <p className="font-mono text-[11px] text-emerald-700">{t.product?.sku}</p>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">
                                            {t.sourceWarehouse?.name || 'External'}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-700">
                                            {t.targetWarehouse?.name || 'External'}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-bold text-emerald-800">
                                            +{t.quantity}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                                            {new Date(t.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: PROCUREMENT REPORT */}
                {activeTab === 'PROCUREMENT' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 print:hidden">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Procurement & Purchase Order Summary</h2>
                            <p className="text-xs text-slate-500">Inbound purchase orders and vendor fulfilling records</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">PO Number</th>
                                    <th className="py-3 px-4">Supplier</th>
                                    <th className="py-3 px-4">Destination</th>
                                    <th className="py-3 px-4 text-right">Total Cost</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4">Issued Date</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {purchaseOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{po.poNumber}</td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">{po.supplier?.name}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-700">{po.warehouse?.code}</td>
                                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">${po.totalCost.toFixed(2)}</td>
                                        <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold ${
                                                    po.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    {po.status}
                                                </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500 font-medium">{new Date(po.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 4: AUDIT LOG REPORT */}
                {activeTab === 'AUDIT' && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-200 print:hidden">
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Compliance Audit Trail</h2>
                            <p className="text-xs text-slate-500">Immutable record of system operations, stock adjustments, and administrative events</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Operator / Role</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Details</th>
                                    <th className="py-3 px-4">Timestamp</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/85 transition">
                                        <td className="py-3.5 px-4">
                                            <p className="font-semibold text-slate-900">{log.user?.email || 'System'}</p>
                                            <p className="font-mono text-[10px] text-emerald-700">{log.user?.role || 'SYSTEM'}</p>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800">{log.action}</td>
                                        <td className="py-3.5 px-4 text-slate-600">{log.details}</td>
                                        <td className="py-3.5 px-4 text-slate-500 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}