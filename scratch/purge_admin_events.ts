import prisma from '../src/lib/db';

async function main() {
  await prisma.$executeRawUnsafe(`DELETE FROM analytics_events WHERE page LIKE '/admin%'`);
  await prisma.$executeRawUnsafe(`
    DELETE FROM analytics_visitors 
    WHERE visitor_id NOT IN (
      SELECT DISTINCT visitor_id FROM analytics_events
    )
  `);
  console.log('Purged all /admin events from analytics tables.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

