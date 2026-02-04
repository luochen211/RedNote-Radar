
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const users = await prisma.user.findMany();
    console.log('Connection successful.');
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ${u.username} (Role: ${u.role})`));
  } catch (e) {
    console.error('Database connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
