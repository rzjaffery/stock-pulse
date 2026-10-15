// prisma/seed.ts
import { PrismaClient, Role, POStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
    console.log('🌱 Starting StockPulse database seeding...');

    // 1. Clean existing database data (optional, remove if you want to keep existing data)
    await db.auditLog.deleteMany();
    await db.purchaseOrderItem.deleteMany();
    await db.purchaseOrder.deleteMany();
    await db.stockMovement.deleteMany();
    await db.stockLevel.deleteMany();
    await db.product.deleteMany();
    await db.supplier.deleteMany();
    await db.warehouse.deleteMany();
    await db.user.deleteMany();
    await db.organization.deleteMany();

    // 2. Create Demo Organization
    const organization = await db.organization.create({
        data: {
            name: 'Acme Global Logistics',
        },
    });
    console.log(`🏢 Created Organization: ${organization.name}`);

    // 3. Create Users (Admin, Manager, Operator)
    const defaultPassword = await bcrypt.hash('password123', 10);

    const admin = await db.user.create({
        data: {
            name: 'Alexander Admin',
            email: 'admin@stockpulse.com',
            password: defaultPassword,
            role: Role.ADMIN,
            organizationId: organization.id,
        },
    });

    const manager = await db.user.create({
        data: {
            name: 'Morgan Manager',
            email: 'manager@stockpulse.com',
            password: defaultPassword,
            role: Role.MANAGER,
            organizationId: organization.id,
        },
    });

    const operator = await db.user.create({
        data: {
            name: 'Oliver Operator',
            email: 'operator@stockpulse.com',
            password: defaultPassword,
            role: Role.OPERATOR,
            organizationId: organization.id,
        },
    });
    console.log('👥 Created demo users (Password for all: password123)');

    // 4. Create Warehouses
    const primaryHub = await db.warehouse.create({
        data: {
            name: 'North American Fulfillment Center',
            code: 'WH-NA-01',
            location: 'Chicago, IL',
            organizationId: organization.id,
        },
    });

    const secondaryHub = await db.warehouse.create({
        data: {
            name: 'European Distribution Hub',
            code: 'WH-EU-02',
            location: 'Rotterdam, Netherlands',
            organizationId: organization.id,
        },
    });
    console.log('🏬 Created 2 operational warehouses');

    // 5. Create Suppliers
    const supplierApex = await db.supplier.create({
        data: {
            name: 'Apex Manufacturing Corp',
            email: 'orders@apexsupplies.com',
            phone: '+1 (555) 019-2834',
            address: '100 Industrial Parkway, Detroit, MI',
            organizationId: organization.id,
        },
    });

    const supplierGlobal = await db.supplier.create({
        data: {
            name: 'Global Tech Components Ltd',
            email: 'sales@globaltech.net',
            phone: '+44 20 7946 0912',
            address: '42 Silicon Way, London, UK',
            organizationId: organization.id,
        },
    });
    console.log('🤝 Created 2 enterprise suppliers');

    // 6. Create Products & Stock Levels
    const productsData = [
        { name: 'Industrial Hydraulic Pump', sku: 'HYD-PUMP-01', unitPrice: 350.00, minStock: 5, initialQty: 12 },
        { name: 'Heavy-Duty Steel Bracket', sku: 'BRACKET-ST-88', unitPrice: 24.50, minStock: 25, initialQty: 10 },
        { name: 'Automated Sensor Module v2', sku: 'SEN-MOD-V2', unitPrice: 120.00, minStock: 15, initialQty: 8 }, // Low stock trigger test!
        { name: 'Precision Ball Bearing (100pk)', sku: 'BEAR-BALL-100', unitPrice: 45.00, minStock: 20, initialQty: 45 },
    ];

    for (const p of productsData) {
        const product = await db.product.create({
            data: {
                name: p.name,
                sku: p.sku,
                unitPrice: p.unitPrice,
                organizationId: organization.id,
            },
        });

        // Assign to Primary Warehouse
        await db.stockLevel.create({
            data: {
                productId: product.id,
                warehouseId: primaryHub.id,
                quantity: p.initialQty,
                minThreshold: p.minStock,
                organizationId: organization.id,
            },
        });
    }
    console.log('📦 Created products and assigned stock levels across warehouses');

    // 7. Create Sample Purchase Order
    const sampleProduct = await db.product.findFirst({
        where: { organizationId: organization.id, sku: 'SEN-MOD-V2' },
    });

    if (sampleProduct) {
        await db.purchaseOrder.create({
            data: {
                poNumber: 'PO-2026-001',
                status: POStatus.ISSUED,
                totalCost: 1500.00,
                supplierId: supplierApex.id,
                warehouseId: primaryHub.id,
                organizationId: organization.id,
                items: {
                    create: [
                        {
                            productId: sampleProduct.id,
                            quantityOrdered: 25,
                            unitCost: 60.00,
                        },
                    ],
                },
            },
        });
        console.log('📋 Created initial sample Purchase Order (PO-2026-001)');
    }

    console.log('✨ Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });