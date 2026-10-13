// src/app/actions/profile.ts
'use server';

import { db } from '@/lib/db';
import { getTenantContext } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfileDetailsAction(params: { name: string }) {
    try {
        const { userId, organizationId } = await getTenantContext();

        if (!params.name || params.name.trim().length === 0) {
            return { success: false, error: 'Name cannot be empty.' };
        }

        await db.user.update({
            where: { id: userId },
            data: { name: params.name.trim() },
        });

        revalidatePath('/profile');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to update profile.' };
    }
}

export async function changePasswordAction(params: { currentPass: string; newPass: string }) {
    try {
        const { userId } = await getTenantContext();
        const { currentPass, newPass } = params;

        if (!currentPass || !newPass) {
            return { success: false, error: 'Please fill in all password fields.' };
        }

        if (newPass.length < 8) {
            return { success: false, error: 'New password must be at least 8 characters long.' };
        }

        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            return { success: false, error: 'User record or password hash missing.' };
        }

        // Verify existing password
        const isMatch = await bcrypt.compare(currentPass, user.password);
        if (!isMatch) {
            return { success: false, error: 'Current password is incorrect.' };
        }

        // Hash new password
        const hashedNewPass = await bcrypt.hash(newPass, 10);

        await db.user.update({
            where: { id: userId },
            data: { password: hashedNewPass },
        });

        revalidatePath('/profile');
        return { success: true };
    } catch (error: unknown) {
        const err = error as { message?: string };
        return { success: false, error: err.message || 'Failed to update password.' };
    }
}