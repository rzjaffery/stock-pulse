// src/app/page.tsx
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { getDashboardMetrics } from '@/app/actions/queries';
import { getFilteredInventory, getFilteredMovements } from '@/app/actions/inventory';
import Sidebar from '@/components/Sidebar';
import StockTable from '@/components/StockTable';
import MovementsTable from '@/components/MovementsTable';

export const revalidate = 0;

export default async function DashboardPage() {
  const { organizationId } = await getTenantContext();

  const [metrics, warehouses, stockLevels, movements] = await Promise.all([
    getDashboardMetrics(),
    db.warehouse.findMany({
      where: { organizationId },
      select: { id: true, name: true, code: true },
    }),
    getFilteredInventory(),
    getFilteredMovements(),
  ]);

  return (
      <div className="min-h-screen bg-slate-50 text-slate-700 font-sans flex">
        <Sidebar />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Overview
            </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Command Center</h1>
            </div>
          </header>

          <main className="p-6 md:p-8 space-y-8 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-xl">
                <span className="text-xs font-semibold uppercase text-emerald-700">Total Valuation</span>
                <p className="text-2xl font-bold mt-1 text-emerald-700">
                  ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl">
                <span className="text-xs font-semibold uppercase text-emerald-700">Active Warehouses</span>
                <p className="text-2xl font-bold mt-1 text-slate-900">{metrics.totalWarehouses}</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl">
                <span className="text-xs font-semibold uppercase text-emerald-700">Catalog SKUs</span>
                <p className="text-2xl font-bold mt-1 text-slate-900">{metrics.totalProducts}</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl">
                <span className="text-xs font-semibold uppercase text-emerald-700">Low Stock Triggers</span>
                <p className={`text-2xl font-bold mt-1 ${metrics.lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {metrics.lowStockCount} Items
                </p>
              </div>
            </div>

            <StockTable initialStock={stockLevels} warehouses={warehouses} />
            <MovementsTable initialMovements={movements} />
          </main>
        </div>
      </div>
  );
}