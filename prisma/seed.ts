// prisma/seed.ts
import { PrismaClient, Role, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting multi-tenant database seed...');

    // 1. Clean existing records
    await prisma.auditLog.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.stockLevel.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();

    // 2. Create Default Organization
    const org = await prisma.organization.create({
        data: {
            clerkOrgId: 'org_demo_123456789',
            name: 'Acme Logistics Corp',
            slug: 'acme-logistics',
        },
    });

    // 3. Create Demo Users mapped to Organization
    const admin = await prisma.user.create({
        data: {
            clerkUserId: 'user_admin_demo',
            organizationId: org.id,
            email: 'admin@acmelogistics.io',
            name: 'Sarah Connor',
            role: Role.ORG_ADMIN,
        },
    });

    const manager = await prisma.user.create({
        data: {
            clerkUserId: 'user_manager_demo',
            organizationId: org.id,
            email: 'manager@acmelogistics.io',
            name: 'Alex Mercer',
            role: Role.WAREHOUSE_MANAGER,
        },
    });

    // 4. Create Warehouses scoped to Organization
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

    // 5. Create Category & Products
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

    // 6. Create Initial Multi-Tenant Stock Levels
    await prisma.stockLevel.createMany({
        data: [
            { organizationId: org.id, productId: macbook.id, warehouseId: whEast.id, quantity: 45, minThreshold: 10 },
            { organizationId: org.id, productId: macbook.id, warehouseId: whWest.id, quantity: 12, minThreshold: 15 },
            { organizationId: org.id, productId: monitor.id, warehouseId: whEast.id, quantity: 8, minThreshold: 20 },
        ],
    });

    // 7. Record Inbound Movement
    await prisma.stockMovement.create({
        data: {
            organizationId: org.id,
            type: MovementType.INBOUND,
            quantity: 45,
            notes: 'Initial bulk shipment received from manufacturer',
            productId: macbook.id,
            targetWarehouseId: whEast.id,
            userId: manager.id,
        },
    });

    console.log('✅ Multi-tenant database successfully seeded!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });