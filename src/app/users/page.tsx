// src/app/users/page.tsx
import React from 'react';
import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';
import UsersClientView from './UsersClientView';
import { auth } from '@/auth';

export const revalidate = 0;

export default async function UsersPage() {
    const session = await auth();
    const { organizationId, role } = await getTenantContext();

    // Fetch all users in the same organization
    const users = await db.user.findMany({
        where: { organizationId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex">
            <Sidebar user={session?.user} />
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <UsersClientView
                    initialUsers={users}
                    currentUserRole={role}
                />
            </div>
        </div>
    );
}