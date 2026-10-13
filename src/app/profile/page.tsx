// src/app/profile/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import ProfileClientView from './ProfileClientView';
import { auth } from '@/auth';

export const revalidate = 0;

export default async function ProfilePage() {
    const session = await auth();
    const { userId, organizationId, role } = await getTenantContext();

    // Fetch complete user profile and organization details
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            organization: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    // Fetch user's recent activity logs
    const userAuditCount = await db.auditLog.count({
        where: { userId, organizationId },
    });

    const recentLogs = await db.auditLog.findMany({
        where: { userId, organizationId },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
            <Sidebar user={session?.user} />
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <ProfileClientView
                    user={{
                        id: user?.id || userId,
                        name: user?.name || '',
                        email: user?.email || '',
                        role: user?.role || role,
                        createdAt: user?.createdAt ? new Date(user.createdAt) : new Date(),
                        organizationName: user?.organization?.name || 'StockPulse Enterprise',
                        organizationId,
                    }}
                    auditCount={userAuditCount}
                    recentLogs={recentLogs}
                />
            </div>
        </div>
    );
}