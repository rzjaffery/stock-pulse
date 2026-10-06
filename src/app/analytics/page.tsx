// src/app/analytics/page.tsx
import Sidebar from '@/components/Sidebar';
import { getAnalyticsData } from '@/app/actions/analytics';

export const revalidate = 0;

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
                    <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              BI & Analytics
            </span>
                        <h1 className="text-xl font-bold text-white tracking-tight">Stock Performance & Intelligence</h1>
                    </div>
                </header>

                <main className="p-6 md:p-8 space-y-8 max-w-7xl">
                    {/* Executive Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Total Portfolio Value</span>
                            <p className="text-3xl font-extrabold mt-1 text-emerald-400">
                                ${data.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Total Units in Inventory</span>
                            <p className="text-3xl font-extrabold mt-1 text-white">
                                {data.totalUnitsInStock.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                            <span className="text-xs font-semibold uppercase text-slate-400">Critical Reorder Alerts</span>
                            <p className={`text-3xl font-extrabold mt-1 ${data.lowStockItems.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                {data.lowStockItems.length} SKUs
                            </p>
                        </div>
                    </div>

                    {/* Warehouse Breakdown */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white">Warehouse Valuation & Volume Distribution</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.warehouseValuation.map((wh) => (
                                <div key={wh.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white">{wh.name}</h3>
                                        <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {wh.code}
                    </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800/60 text-xs space-y-1">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Valuation:</span>
                                            <span className="font-bold text-slate-200">
                        ${wh.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>Units On Hand:</span>
                                            <span className="font-bold text-slate-200">{wh.totalItems.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Action Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white">Inventory Reorder Triggers</h2>
                        {data.lowStockItems.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4">All stock levels are optimal across all warehouses.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4">SKU</th>
                                        <th className="py-3 px-4">Warehouse</th>
                                        <th className="py-3 px-4 text-right">Current Qty</th>
                                        <th className="py-3 px-4 text-right">Min Threshold</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                    {data.lowStockItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-medium text-white">{item.productName}</td>
                                            <td className="py-3 px-4 font-mono text-xs text-indigo-400">{item.sku}</td>
                                            <td className="py-3 px-4 text-slate-400">{item.warehouseName}</td>
                                            <td className="py-3 px-4 text-right font-bold text-amber-400">{item.quantity}</td>
                                            <td className="py-3 px-4 text-right font-medium text-slate-400">{item.minThreshold}</td>
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