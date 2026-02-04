
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyLogin() {
    const username = 'testuser';
    const password = 'password123';

    console.log(`Attempting login for: ${username}`);

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            console.log('User not found in DB.');
            return;
        }

        console.log('User found:', user.username);
        console.log('Stored Hash:', user.password);

        const isValid = await bcrypt.compare(password, user.password);
        console.log(`Password 'password123' valid? ${isValid}`);

    } catch (e) {
        console.error('Error during verification:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLogin();
