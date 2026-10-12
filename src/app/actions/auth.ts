// src/app/actions/auth.ts
'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function registerUserAction(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { success: false, error: 'All fields are required.' };
    }

    try {
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: 'Email already registered.' };
        }

        // Ensure a default organization exists
        let org = await db.organization.findFirst();
        if (!org) {
            org = await db.organization.create({
                data: { name: 'Royal Emerald Enterprise' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                organizationId: org.id,
            },
        });

        // Automatically sign in after registration
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        return { success: true };
    } catch (err: any) {
        if (err instanceof AuthError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: err.message || 'Failed to register account.' };
    }
}