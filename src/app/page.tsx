// src/app/page.tsx
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { getDashboardMetrics } from '@/app/actions/queries';
import { getFilteredInventory, getFilteredMovements } from '@/app/actions/inventory';
import Sidebar from '@/components/Sidebar';
import AddProductModal from '@/components/AddProductModal';
import TransferModal from '@/components/TransferModal';
import AddWarehouseModal from '@/components/AddWarehouseModal';
import StockTable from '@/components/StockTable';
import MovementsTable from '@/components/MovementsTable';

export const revalidate = 0;

export default async function DashboardPage() {
  const { organizationId } = await getTenantContext();

  const [metrics, warehouses, products, rawUsers, stockLevels, movements] = await Promise.all([
    getDashboardMetrics(),
    db.warehouse.findMany({
      where: { organizationId },
      select: { id: true, name: true, code: true },
    }),
    db.product.findMany({
      where: { organizationId },
      select: { id: true, name: true, sku: true },
    }),
    db.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true },
    }),
    getFilteredInventory(),
    getFilteredMovements(),
  ]);

  const users = rawUsers.map((u) => ({
    id: u.id,
    name: u.name || u.email || 'Unnamed User',
  }));

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
        {/* SaaS Sidebar Navigation */}
        <Sidebar warehouses={warehouses} products={products} users={users} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">

          {/* Top Navbar */}
          <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                Overview
              </span>
                <h1 className="text-xl font-bold text-white tracking-tight">Supply Chain Dashboard</h1>
              </div>
            </div>

            {/* Quick Header Navbar Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <AddProductModal warehouses={warehouses} />
              <TransferModal warehouses={warehouses} products={products} users={users} />
            </div>
          </header>

          {/* Dashboard Content Container */}
          <main className="p-6 md:p-8 space-y-8 max-w-7xl">

            {/* Analytics Overview Metric Grid */}
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

            {/* Stock Catalog Section */}
            <section id="catalog">
              <StockTable initialStock={stockLevels} warehouses={warehouses} />
            </section>

            {/* Movement Log Section */}
            <section id="movements">
              <MovementsTable initialMovements={movements} />
            </section>

          </main>
        </div>
      </div>
  );
}