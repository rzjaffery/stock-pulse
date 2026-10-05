// src/app/page.tsx
import { db } from '@/lib/db';
import { getDashboardMetrics } from '@/app/actions/queries';
import TransferModal from '@/components/TransferModal';

export const revalidate = 0; // Ensures fresh database data on request

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  // Fetch helper lists for the transfer modal dropdowns
  const [warehouses, products, users] = await Promise.all([
    db.warehouse.findMany({ select: { id: true, name: true, code: true } }),
    db.product.findMany({ select: { id: true, name: true, sku: true } }),
    db.user.findMany({ select: { id: true, name: true } }),
  ]);

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">StockPulse Engine</h1>
                <span className="text-xs bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-0.5 rounded-full font-mono">
                PostgreSQL + Prisma
              </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">Multi-Warehouse Inventory & Transactional Audit Control</p>
            </div>

            <TransferModal warehouses={warehouses} products={products} users={users} />
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Valuation</span>
              <p className="text-2xl font-bold mt-1 text-emerald-400">
                ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs font-semibold uppercase text-slate-400">Active Warehouses</span>
              <p className="text-2xl font-bold mt-1 text-white">{metrics.totalWarehouses}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs font-semibold uppercase text-slate-400">Catalog SKUs</span>
              <p className="text-2xl font-bold mt-1 text-white">{metrics.totalProducts}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-xs font-semibold uppercase text-slate-400">Low Stock Triggers</span>
              <p className={`text-2xl font-bold mt-1 ${metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {metrics.lowStockCount} Items
              </p>
            </div>
          </div>

          {/* Low Stock Alerts & Recent Movement Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Stock Movements Audit Feed */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Audit Trail: Recent Stock Movements</h2>

              <div className="space-y-3">
                {metrics.recentMovements.length === 0 ? (
                    <p className="text-sm text-slate-500">No stock movements recorded yet.</p>
                ) : (
                    metrics.recentMovements.map((move) => (
                        <div
                            key={move.id}
                            className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-sm"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200">{move.product.name}</span>
                              <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                          {move.type}
                        </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {move.sourceWarehouse ? move.sourceWarehouse.code : 'Supplier'} →{' '}
                              {move.targetWarehouse ? move.targetWarehouse.code : 'Customer'} by {move.user.name}
                            </p>
                          </div>

                          <div className="text-right">
                      <span className="font-mono font-bold text-white text-base">
                        {move.type === 'OUTBOUND' ? '-' : '+'}{move.quantity}
                      </span>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(move.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>

            {/* Low Stock Watchlist */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Low Stock Warnings</h2>

              <div className="space-y-3">
                {metrics.lowStockItems.length === 0 ? (
                    <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                      All inventory levels are above configured threshold triggers.
                    </div>
                ) : (
                    metrics.lowStockItems.map((item) => (
                        <div
                            key={item.id}
                            className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-semibold text-amber-200">{item.product.name}</p>
                            <p className="text-xs text-amber-400/80">{item.warehouse.name}</p>
                          </div>
                          <div className="text-right">
                      <span className="text-sm font-mono font-bold text-amber-300">
                        {item.quantity} / {item.minThreshold} min
                      </span>
                          </div>
                        </div>
                    ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
  );
}