
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await prisma.user.upsert({
            where: { username: 'testuser' },
            update: {},
            create: {
                username: 'testuser',
                password: hashedPassword,
                role: 'user'
            },
        });
        console.log('Test user created:', user);
    } catch (e) {
        console.error('Error creating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
