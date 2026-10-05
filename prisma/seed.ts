import { PrismaClient, Role, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Clean existing records
    await prisma.auditLog.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.stockLevel.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const admin = await prisma.user.create({
        data: {
            email: 'admin@stockpulse.io',
            name: 'Sarah Connor (Admin)',
            role: Role.ADMIN,
        },
    });

    const manager = await prisma.user.create({
        data: {
            email: 'manager@stockpulse.io',
            name: 'Alex Mercer (Manager)',
            role: Role.MANAGER,
        },
    });

    // 3. Create Warehouses
    const whEast = await prisma.warehouse.create({
        data: {
            name: 'East Coast Distribution Center',
            code: 'WH-EAST-01',
            location: 'New York, NY',
        },
    });

    const whWest = await prisma.warehouse.create({
        data: {
            name: 'West Coast Logistics Hub',
            code: 'WH-WEST-02',
            location: 'Los Angeles, CA',
        },
    });

    // 4. Create Category & Products
    const electronics = await prisma.category.create({
        data: { name: 'Electronics & Computing' },
    });

    const macbook = await prisma.product.create({
        data: {
            sku: 'ELEC-MBP-16',
            name: 'MacBook Pro 16"',
            description: 'M3 Max, 36GB Unified Memory, 1TB SSD',
            price: 3499.0,
            categoryId: electronics.id,
        },
    });

    const monitor = await prisma.product.create({
        data: {
            sku: 'ELEC-DELL-U27',
            name: 'Dell UltraSharp 27" 4K Monitor',
            description: 'USB-C Hub, IPS Black Panel',
            price: 619.0,
            categoryId: electronics.id,
        },
    });

    // 5. Create Initial Stock Levels
    await prisma.stockLevel.createMany({
        data: [
            { productId: macbook.id, warehouseId: whEast.id, quantity: 45, minThreshold: 10 },
            { productId: macbook.id, warehouseId: whWest.id, quantity: 12, minThreshold: 15 },
            { productId: monitor.id, warehouseId: whEast.id, quantity: 8, minThreshold: 20 }, // Low stock trigger!
        ],
    });

    // 6. Record Initial Inbound Movement
    await prisma.stockMovement.create({
        data: {
            type: MovementType.INBOUND,
            quantity: 45,
            notes: 'Initial bulk shipment received from manufacturer',
            productId: macbook.id,
            targetWarehouseId: whEast.id,
            userId: manager.id,
        },
    });

    console.log('✅ Database successfully seeded!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });