// src/app/actions/users.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export type CreateMemberParams = {
    name: string;
    email: string;
    password: string;
    role: Role;
};

export async function updateUserRoleAction(targetUserId: string, newRole: Role) {
    try {
        const { userId, organizationId, role: adminRole } = await getTenantContext();

        if (adminRole !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only Administrators can modify user roles.' };
        }

        if (userId === targetUserId) {
            return { success: false, error: 'You cannot modify your own administrative role.' };
        }

        const targetUser = await db.user.findFirst({
            where: { id: targetUserId, organizationId },
        });

        if (!targetUser) {
            return { success: false, error: 'Target user not found in your organization.' };
        }

        await db.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to update user role.' };
    }
}

export async function createTeamMemberAction(params: CreateMemberParams) {
    try {
        // Explicitly rename role to adminRole to prevent variable shadowing
        const { organizationId, role: adminRole } = await getTenantContext();

        if (adminRole !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only Administrators can add new team members.' };
        }

        const { name, email, password, role: memberRole } = params;

        if (!name || !email || !password || !memberRole) {
            return { success: false, error: 'Please provide all required fields.' };
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, error: 'A user with this email address already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: memberRole,
                organizationId,
            },
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to create team member.' };
    }
}