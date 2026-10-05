// prisma/seed.ts
import { PrismaClient, Role, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting multi-tenant database seed...');

    // Get the first organization created from your Clerk login, or create a default
    let org = await prisma.organization.findFirst();

    if (!org) {
        org = await prisma.organization.create({
            data: {
                clerkOrgId: 'org_demo_123456789',
                name: "Rayyan's Organization",
                slug: 'rayyans-organization',
            },
        });
    }

    console.log(`📦 Seeding data for Organization ID: ${org.id} (${org.name})`);

    // 1. Clean existing records for this org
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.stockMovement.deleteMany({ where: { organizationId: org.id } });
    await prisma.stockLevel.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.category.deleteMany({ where: { organizationId: org.id } });
    await prisma.warehouse.deleteMany({ where: { organizationId: org.id } });

    // 2. Create Warehouses
    const whEast = await prisma.warehouse.create({
        data: {
            organizationId: org.id,
            name: 'East Coast Distribution Center',
            code: 'WH-EAST-01',
            location: 'New York, NY',
        },
    });

    const whWest = await prisma.warehouse.create({
        data: {
            organizationId: org.id,
            name: 'West Coast Logistics Hub',
            code: 'WH-WEST-02',
            location: 'Los Angeles, CA',
        },
    });

    // 3. Create Category & Products
    const electronics = await prisma.category.create({
        data: {
            organizationId: org.id,
            name: 'Electronics & Computing',
            description: 'Laptops, Monitors, and Accessories',
        },
    });

    const macbook = await prisma.product.create({
        data: {
            organizationId: org.id,
            categoryId: electronics.id,
            sku: 'ELEC-MBP-16',
            name: 'MacBook Pro 16"',
            description: 'M3 Max, 36GB Unified Memory, 1TB SSD',
            unitPrice: 3499.0,
        },
    });

    const monitor = await prisma.product.create({
        data: {
            organizationId: org.id,
            categoryId: electronics.id,
            sku: 'ELEC-DELL-U27',
            name: 'Dell UltraSharp 27" 4K Monitor',
            description: 'USB-C Hub, IPS Black Panel',
            unitPrice: 619.0,
        },
    });

    // 4. Create Stock Levels
    await prisma.stockLevel.createMany({
        data: [
            { organizationId: org.id, productId: macbook.id, warehouseId: whEast.id, quantity: 45, minThreshold: 10 },
            { organizationId: org.id, productId: macbook.id, warehouseId: whWest.id, quantity: 12, minThreshold: 15 },
            { organizationId: org.id, productId: monitor.id, warehouseId: whEast.id, quantity: 8, minThreshold: 20 },
        ],
    });

    console.log('✅ Multi-tenant database successfully seeded for your active organization!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });