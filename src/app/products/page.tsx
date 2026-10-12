// src/app/products/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import ProductsClientView from './ProductsClientView';

export const revalidate = 0;

export default async function ProductsPage() {
    const { organizationId } = await getTenantContext();

    const warehouses = await db.warehouse.findMany({
        where: { organizationId },
        select: { id: true, name: true, code: true },
    });

    const products = await db.product.findMany({
        where: { organizationId },
        include: {
            category: true,
            stockLevels: {
                include: {
                    warehouse: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <ProductsClientView
                    initialProducts={products}
                    warehouses={warehouses}
                />
            </div>
        </div>
    );
}