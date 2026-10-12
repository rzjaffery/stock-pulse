// src/app/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import DashboardClientView from './DashboardClientView';
import LowStockSection from '@/components/LowStockSection';
import { auth } from '@/auth';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  const { organizationId } = await getTenantContext();

  // 1. Fetch all products with stock levels
  const products = await db.product.findMany({
    where: { organizationId },
    include: {
      stockLevels: true,
    },
  });

  // 2. Calculate Valuation & collect low stock items
  let totalValuation = 0;
  let lowStockCount = 0;

  products.forEach((p) => {
    const totalQty = (p.stockLevels || []).reduce((acc, s) => acc + s.quantity, 0);
    totalValuation += p.unitPrice * totalQty;
  });

  // Fetch explicit low stock records with relations
  const lowStockItems = await db.stockLevel.findMany({
    where: {
      organizationId,
      quantity: {
        lte: db.stockLevel.fields.minThreshold, // items where quantity <= minThreshold
      },
    },
    include: {
      product: true,
      warehouse: true,
    },
    orderBy: { quantity: 'asc' },
  });

  lowStockCount = lowStockItems.length;

  // 3. Count Active Warehouses
  const warehouseCount = await db.warehouse.count({
    where: { organizationId },
  });

  // 4. Fetch Recent Audit Logs
  const recentLogs = await db.auditLog.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  const metrics = {
    totalValuation,
    totalSkus: products.length,
    lowStockCount,
    warehouseCount,
  };

  return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
        <Sidebar user={session?.user} />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <DashboardClientView
              metrics={metrics}
              recentLogs={recentLogs}
              userName={session?.user?.name}
              lowStockSection={<LowStockSection lowStockItems={lowStockItems} />}
          />
        </div>
      </div>
  );
}