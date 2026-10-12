// src/lib/tenant.ts
import { auth } from '@/auth';
import {db} from "@/lib/db";

export async function getTenantContext() {
    const session = await auth();

    if (!session || !session.user) {
        // Fallback for development if not signed in yet
        const defaultOrg = await db.organization.findFirst();
        return {
            userId: 'system-dev-user',
            organizationId: defaultOrg?.id || 'default-org-id',
        };
    }

    return {
        userId: (session.user as any).id,
        organizationId: (session.user as any).organizationId,
    };
}