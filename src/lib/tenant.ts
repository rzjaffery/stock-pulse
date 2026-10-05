// src/lib/tenant.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function getTenantContext() {
    const { userId, orgId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized: Authentication required');
    }

    if (!orgId) {
        throw new Error('No active organization selected. Please select or create an organization in Clerk.');
    }

    // Ensure organization exists in PostgreSQL
    let tenantOrg = await db.organization.findUnique({
        where: { clerkOrgId: orgId },
    });

    if (!tenantOrg) {
        tenantOrg = await db.organization.create({
            data: {
                clerkOrgId: orgId,
                name: 'My Organization',
                slug: orgId.toLowerCase(),
            },
        });
    }

    // Sync User record
    const user = await currentUser();
    const primaryEmail = user?.emailAddresses[0]?.emailAddress || '';
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

    const dbUser = await db.user.upsert({
        where: { clerkUserId: userId },
        update: { organizationId: tenantOrg.id },
        create: {
            clerkUserId: userId,
            organizationId: tenantOrg.id,
            email: primaryEmail,
            name: fullName,
        },
    });

    return {
        organizationId: tenantOrg.id,
        clerkOrgId: orgId,
        userId: dbUser.id,
        userRole: dbUser.role,
    };
}