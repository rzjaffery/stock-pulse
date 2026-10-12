// src/lib/tenant.ts
import { auth } from '@/auth';

export async function getTenantContext() {
    const session = await auth();

    if (!session?.user) {
        throw new Error('Unauthorized: No active session found');
    }

    const userId = (session.user as any).id;
    const organizationId = (session.user as any).organizationId;
    const role = (session.user as any).role || 'OPERATOR';

    return { userId, organizationId, role };
}