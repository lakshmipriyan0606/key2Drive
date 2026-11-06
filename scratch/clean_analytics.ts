import prisma from '../src/lib/db';

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM analytics_events WHERE visitor_id LIKE '%test%'`);
  await prisma.$executeRawUnsafe(`DELETE FROM analytics_visitors WHERE visitor_id LIKE '%test%'`);
  console.log('Cleaned test analytics records.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

