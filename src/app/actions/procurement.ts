'use server'

import {getTenantContext} from "@/lib/tenant";
import {PurchaseOrderSchema, SupplierSchema} from "@/lib/schema";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";

export async function createSupplierAction(input: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}) {
    try {
        const { organizationId } = await getTenantContext();
        const parsed = SupplierSchema.safeParse(input);

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            const formatted = Object.entries(fieldErrors)
                .map(([k, v]) => `${k}: ${(v as string[] | undefined)?.join(', ')}`)
                .join(' | ');
            return { success: false, error: formatted || 'Invalid supplier details' };
        }

        const supplier = await db.supplier.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                phone: parsed.data.phone || '',
                address: parsed.data.address || '',
                organizationId,
            },
        });

        revalidatePath('/procurement');
        return { success: true, supplier };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to create supplier' };
    }
}

export async function createPurchaseOrderAction(input: {
    supplierId: string;
    warehouseId: string;
    productId: string;
    quantityOrdered: number | string;
    unitCost: number | string;
    notes?: string;
}) {
    try {
        const { organizationId } = await getTenantContext();

        const parsed = PurchaseOrderSchema.safeParse({
            ...input,
            quantityOrdered: Number(input.quantityOrdered),
            unitCost: Number(input.unitCost),
        });

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            const formatted = Object.entries(fieldErrors)
                .map(([k, v]) => `${k}: ${(v as string[] | undefined)?.join(', ')}`)
                .join(' | ');
            return { success: false, error: formatted || 'Invalid purchase order details' };
        }

        const { supplierId, warehouseId, productId, quantityOrdered, unitCost, notes } = parsed.data;
        const poNumber = `PO-${Date.now().toString().slice(-6)}`;
        const totalCost = quantityOrdered * unitCost;

        await db.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.create({
                data: {
                    organizationId,
                    supplierId,
                    warehouseId,
                    poNumber,
                    totalCost,
                    notes: notes || '',
                    status: 'ISSUED',
                },
            });

            await tx.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: po.id,
                    productId,
                    quantityOrdered,
                    unitCost,
                },
            });
        });

        revalidatePath('/procurement');
        revalidatePath('/analytics');
        return { success: true };
    } catch (err) {
        const errorObject = err as Error;
        return { success: false, error: errorObject.message || 'Failed to issue purchase order' };
    }
}

export async function receivePurchaseOrderAction(poId: string){
    try {
        const {organizationId}= await getTenantContext();

        await db.$transaction(async (tx)=>{
            const po = await tx.purchaseOrder.findFirst(
                {
                    where:{id:poId, organizationId},
                    include: {items: true}
                }
            )
            if(!po || po.status === 'RECEIVED'){
                throw new Error("Purchase already fulfilled or in order")
            }
            for(const item of po.items){
                const stock = await tx.stockLevel.findFirst({
                    where: { organizationId, productId: item.productId, warehouseId: po.warehouseId },
                });

                if (stock) {
                    await tx.stockLevel.update({
                        where: { id: stock.id },
                        data: { quantity: { increment: item.quantityOrdered } },
                    });
                } else {
                    await tx.stockLevel.create({
                        data: {
                            organizationId,
                            productId: item.productId,
                            warehouseId: po.warehouseId,
                            quantity: item.quantityOrdered,
                            minThreshold: 5,
                        },
                    });
                }

                // 2. Record Inbound Movement
                await tx.stockMovement.create({
                    data: {
                        organizationId,
                        productId: item.productId,
                        targetWarehouseId: po.warehouseId,
                        quantity: item.quantityOrdered,
                        type: 'INBOUND',
                        notes: `Fulfillment of ${po.poNumber}`,
                    },
                });

                // 3. Update Item Quantity Received
                await tx.purchaseOrderItem.update({
                    where: { id: item.id },
                    data: { quantityReceived: item.quantityOrdered },
                });
            }

            // Mark PO as RECEIVED
            await tx.purchaseOrder.update({
                where: {id: poId},
                data: {status: 'RECEIVED'},
            })
        })
        revalidatePath("/procurement")
        revalidatePath("/products")
        revalidatePath("/analytics")
        revalidatePath("/")

        return{success: true}
    }catch (e) {
        return {success: false, error: e};
    }
}
