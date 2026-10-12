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
        const { userId, organizationId, role } = await getTenantContext();

        // 1. Enforce that only ADMINs can change roles
        if (role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only Administrators can modify user roles.' };
        }

        // 2. Prevent an admin from changing their own role
        if (userId === targetUserId) {
            return { success: false, error: 'You cannot modify your own administrative role.' };
        }

        // 3. Verify target user belongs to the same organization
        const targetUser = await db.user.findFirst({
            where: { id: targetUserId, organizationId },
        });

        if (!targetUser) {
            return { success: false, error: 'Target user not found in your organization.' };
        }

        // 4. Update the role
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
        const { organizationId, role: adminRole } = await getTenantContext();

        // 1. Enforce that only ADMINs can add new team members
        if (adminRole !== 'ADMIN') {
            return { success: false, error: 'Unauthorized: Only Administrators can add new team members.' };
        }

        const { name, email, password, role } = params;

        if (!name || !email || !password || !role) {
            return { success: false, error: 'Please provide all required fields.' };
        }

        // 2. Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, error: 'A user with this email address already exists.' };
        }

        // 3. Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user inside the admin's organization
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
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