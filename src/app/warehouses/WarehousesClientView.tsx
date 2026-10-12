// src/app/warehouses/WarehousesClientView.tsx
'use client';

import React, { useState } from 'react';
import AddWarehouseModal from '@/components/AddWarehouseModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import { bulkImportWarehousesAction } from '@/app/actions/bulk';

interface WarehouseData {
    id: string;
    name: string;
    code: string;
    location?: string | null;
    totalSkus: number;
    totalItems: number;
}

export default function WarehousesClientView({
                                                 initialWarehouses,
                                             }: {
    initialWarehouses: WarehouseData[];
}) {
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const sampleWarehousesCsv = `name,code,location
North Logistics Hub,WH-NORTH,"Chicago, IL"
Southern Sorting Facility,WH-SOUTH,"Dallas, TX"`;

    return (
        <>
            <header className="sticky top-0 z-20 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Facilities
          </span>
                    <h1 className="text-xl font-bold text-white tracking-tight mt-1">Warehouse Directory</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-200 border border-emerald-700 rounded-lg flex items-center gap-2"
                    >
                        📊 Bulk Import (CSV)
                    </button>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2"
                    >
                        + Add Single Warehouse
                    </button>
                </div>
            </header>

            <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                {initialWarehouses.length === 0 ? (
                    <div className="bg-emerald-900 border border-emerald-800 rounded-xl p-8 text-center text-emerald-400">
                        No warehouses created yet. Click <strong>+ Add Single Warehouse</strong> or use <strong>Bulk Import (CSV)</strong> to register facilities.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialWarehouses.map((wh) => (
                            <div key={wh.id} className="bg-emerald-900 border border-emerald-800 rounded-xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold text-white">{wh.name}</h3>
                                        <p className="text-xs text-emerald-400 mt-0.5">{wh.location || 'Primary Facility'}</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {wh.code}
                  </span>
                                </div>

                                <div className="pt-3 border-t border-emerald-800 space-y-1.5 text-xs text-emerald-400">
                                    <div className="flex justify-between">
                                        <span>Unique SKUs:</span>
                                        <span className="font-bold text-white">{wh.totalSkus}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Units Stored:</span>
                                        <span className="font-bold text-emerald-400">{wh.totalItems.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AddWarehouseModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />

            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Import Warehouses via CSV"
                templateCsv={sampleWarehousesCsv}
                templateFileName="warehouses_import_template.csv"
                onUpload={bulkImportWarehousesAction}
            />
        </>
    );
}