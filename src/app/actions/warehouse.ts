'use server'

import {revalidatePath} from "next/cache";
import {getTenantContext} from "@/lib/tenant";
import {db} from "@/lib/db";

export type CreateWarehouseParams = {
    name: string
    code: string
    location: string
}
export async function CreateWarehouseAction(params: CreateWarehouseParams){
    try {
        const { organizationId } = await getTenantContext();
        const { name, code, location } = params;

        if (!name || !code) {
            return { success: false, error: 'Warehouse Name and Code are required.' };
        }

        await db.warehouse.create({
            data: {
                organizationId,
                name,
                code: code.toUpperCase(),
                location: location || 'Primary Location',
            },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: 'A warehouse with this Code already exists.' };
        }
        return { success: false, error: error?.message || 'Failed to create warehouse.' };
    }
}
