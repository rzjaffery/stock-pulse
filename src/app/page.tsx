// src/app/page.tsx
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { getDashboardMetrics } from '@/app/actions/queries';
import { getFilteredInventory, getFilteredMovements } from '@/app/actions/inventory';
import TransferModal from '@/components/TransferModal';
import StockTable from '@/components/StockTable';
import MovementsTable from '@/components/MovementsTable';
import AddProductModal from "@/components/AddProductModal";

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
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">StockPulse SaaS Engine</h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">Multi-Tenant Inventory & Supply Chain Command Center</p>
            </div>

            <AddProductModal warehouses={warehouses} />
            <TransferModal warehouses={warehouses} products={products} users={users} />
          </div>

          {/* Dashboard Analytics Grid */}
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

          {/* Product Catalog & Stock Table */}
          <StockTable initialStock={stockLevels} warehouses={warehouses} />

          {/* Stock Movement Audit Log Table */}
          <MovementsTable initialMovements={movements} />
        </div>
      </div>
  );
}