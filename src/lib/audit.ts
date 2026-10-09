// src/lib/audit.ts
import { db } from '@/lib/db';
import { AuditAction } from '@prisma/client';

export type LogAuditParams = {
    organizationId: string;
    userId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    details: string;
    metadata?: Record<string, unknown>;
    tx?: any; // Allows passing an active Prisma transaction client
};

export async function logAuditActivity({
                                           organizationId,
                                           userId,
                                           action,
                                           entity,
                                           entityId,
                                           details,
                                           metadata,
                                           tx,
                                       }: LogAuditParams) {
    const client = tx || db;

    return client.auditLog.create({
        data: {
            organizationId,
            userId: userId || null,
            action,
            entity,
            entityId: entityId || null,
            details,
            metadata: metadata ? JSON.stringify(metadata) : null,
        },
    });
}