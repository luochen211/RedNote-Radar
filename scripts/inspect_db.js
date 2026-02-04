const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', users);

    const submissions = await prisma.submission.findMany();
    console.log('Submissions:', submissions);

    await prisma.$disconnect();
}

main();
