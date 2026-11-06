import prisma from '../src/lib/db';

async function main() {
  const visitors = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM analytics_visitors');
  const events = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM analytics_events');
  console.log('Visitors count:', visitors.length);
  console.log('Events count:', events.length);
  console.log('Recent 5 events:');
  events.slice(-5).forEach(e => console.log(e));
}

main().catch(console.error).finally(() => prisma.$disconnect());

