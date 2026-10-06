// src/app/warehouses/page.tsx
'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AddWarehouseModal from '@/components/AddWarehouseModal';
import BulkUploadModal from '@/components/BulkUploadModal';
import { bulkImportWarehousesAction } from '@/app/actions/bulk';

export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const sampleWarehousesCsv = `name,code,location
North Logistics Hub,WH-NORTH,"Chicago, IL"
Southern Sorting Facility,WH-SOUTH,"Dallas, TX"`;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              Facilities
            </span>
                        <h1 className="text-xl font-bold text-white tracking-tight mt-1">Warehouse Directory</h1>
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
                            + Add Single Warehouse
                        </button>
                    </div>
                </header>

                <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {warehouses.map((wh) => (
                            <div key={wh.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-base font-bold text-white">{wh.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{wh.location || 'No location set'}</p>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                    {wh.code}
                  </span>
                                </div>

                                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                                    <span>Assigned SKUs:</span>
                                    <span className="font-bold text-white">{wh._count?.stockLevels || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            <AddWarehouseModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />

            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                title="Bulk Import Warehouses via CSV"
                templateCsv={sampleWarehousesCsv}
                templateFileName="warehouses_import_template.csv"
                onUpload={bulkImportWarehousesAction}
            />
        </div>
    );
}