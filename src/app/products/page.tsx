// src/app/products/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import ProductsClientView from './ProductsClientView';

export const revalidate = 0;

export default async function ProductsPage() {
    const { organizationId } = await getTenantContext();

    const [products, warehouses] = await Promise.all([
        db.product.findMany({
            where: { organizationId },
            include: {
                category: { select: { name: true } },
                stockLevels: {
                    include: {
                        warehouse: { select: { name: true, code: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        db.warehouse.findMany({
            where: { organizationId },
            select: { id: true, name: true, code: true },
        }),
    ]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <ProductsClientView
                    initialProducts={products as any}
                    warehouses={warehouses}
                />
            </div>
        </div>
    );
}