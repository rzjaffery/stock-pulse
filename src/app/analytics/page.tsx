// src/app/analytics/page.tsx
import Sidebar from '@/components/Sidebar';
import { getAnalyticsData } from '@/app/actions/analytics';

export const revalidate = 0;

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              BI & Analytics
            </span>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Performance & Intelligence</h1>
                    </div>
                </header>

                <main className="p-6 md:p-8 space-y-8 max-w-7xl">
                    {/* Executive Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Total Portfolio Value</span>
                            <p className="text-3xl font-extrabold mt-1 text-emerald-700">
                                ${data.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Total Units in Inventory</span>
                            <p className="text-3xl font-extrabold mt-1 text-slate-900">
                                {data.totalUnitsInStock.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-emerald-700">Critical Reorder Alerts</span>
                            <p className={`text-3xl font-extrabold mt-1 ${data.lowStockItems.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                {data.lowStockItems.length} SKUs
                            </p>
                        </div>
                    </div>

                    {/* Warehouse Breakdown */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-900">Warehouse Valuation & Volume Distribution</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.warehouseValuation.map((wh) => (
                                <div key={wh.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900">{wh.name}</h3>
                                        <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {wh.code}
                    </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Valuation:</span>
                                            <span className="font-bold text-slate-700">
                        ${wh.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                                        </div>
                                        <div className="flex justify-between text-emerald-700">
                                            <span>Units On Hand:</span>
                                            <span className="font-bold text-slate-700">{wh.totalItems.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Action Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-900">Inventory Reorder Triggers</h2>
                        {data.lowStockItems.length === 0 ? (
                            <p className="text-sm text-emerald-700 py-4">All stock levels are optimal across all warehouses.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-emerald-700 uppercase text-xs border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4">SKU</th>
                                        <th className="py-3 px-4">Warehouse</th>
                                        <th className="py-3 px-4 text-right">Current Qty</th>
                                        <th className="py-3 px-4 text-right">Min Threshold</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                    {data.lowStockItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/40">
                                            <td className="py-3 px-4 font-medium text-slate-900">{item.productName}</td>
                                            <td className="py-3 px-4 font-mono text-xs text-emerald-700">{item.sku}</td>
                                            <td className="py-3 px-4 text-emerald-700">{item.warehouseName}</td>
                                            <td className="py-3 px-4 text-right font-bold text-amber-700">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right font-medium text-emerald-700">{item.minThreshold}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}