const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: password,
                role: 'ADMIN',
                hotelName: 'Headquarters',
                employeeId: 'ADM001'
            },
        });
        console.log('Admin user created:', user);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
