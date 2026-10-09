// src/app/audit/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import AuditClientView from './AuditClientView';

export const revalidate = 0;

export default async function AuditLogsPage() {
    const { organizationId } = await getTenantContext();

    const logs = await db.auditLog.findMany({
        where: { organizationId },
        include: {
            user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Fetch recent 100 activity events
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
            <Sidebar />

            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            Compliance & Security
          </span>
                    <h1 className="text-xl font-bold text-white tracking-tight mt-1">
                        System Audit Trail & History
                    </h1>
                </header>

                <main className="p-6 md:p-8 space-y-6 max-w-7xl">
                    <AuditClientView initialLogs={logs as never} />
                </main>
            </div>
        </div>
    );
}