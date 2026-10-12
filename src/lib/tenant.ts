// src/lib/tenant.ts
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function getTenantContext() {
    const session = await auth();

    if (!session?.user) {
        throw new Error('Unauthorized: No active session found');
    }

    const userId = (session.user as any).id;
    const organizationId = (session.user as any).organizationId;

    return { userId, organizationId };
}