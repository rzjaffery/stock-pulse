// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Find the Organization created when you logged into Clerk and viewed the page
    const org = await prisma.organization.findFirst();

    if (!org) {
        console.error('❌ No Organization found in database! Please sign in once on http://localhost:3000 to auto-create your organization.');
        return;
    }

    console.log(`📦 Seeding data directly into active Organization: "${org.name}" (ID: ${org.id})`);

    // Clean old data for this org
    await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
    await prisma.stockMovement.deleteMany({ where: { organizationId: org.id } });
    await prisma.stockLevel.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.category.deleteMany({ where: { organizationId: org.id } });
    await prisma.warehouse.deleteMany({ where: { organizationId: org.id } });

    // 1. Create Warehouses
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

    // 2. Create Category & Products
    const electronics = await prisma.category.create({
        data: {
            organizationId: org.id,
            name: 'Electronics & Computing',
            description: 'Laptops and Monitors',
        },
    });

    const macbook = await prisma.product.create({
        data: {
            organizationId: org.id,
            categoryId: electronics.id,
            sku: 'ELEC-MBP-16',
            name: 'MacBook Pro 16"',
            description: 'M3 Max, 36GB Memory, 1TB SSD',
            unitPrice: 3499.0,
        },
    });

    const monitor = await prisma.product.create({
        data: {
            organizationId: org.id,
            categoryId: electronics.id,
            sku: 'ELEC-DELL-U27',
            name: 'Dell UltraSharp 27" 4K Monitor',
            description: 'USB-C Hub IPS Panel',
            unitPrice: 619.0,
        },
    });

    // 3. Create Stock Levels
    await prisma.stockLevel.createMany({
        data: [
            { organizationId: org.id, productId: macbook.id, warehouseId: whEast.id, quantity: 45, minThreshold: 10 },
            { organizationId: org.id, productId: macbook.id, warehouseId: whWest.id, quantity: 12, minThreshold: 15 },
            { organizationId: org.id, productId: monitor.id, warehouseId: whEast.id, quantity: 8, minThreshold: 20 },
        ],
    });

    console.log('✅ Successfully seeded warehouses and products into your organization!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });