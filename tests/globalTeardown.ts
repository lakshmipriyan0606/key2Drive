export default function globalSetup() {
  return async () => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.adminNote.deleteMany({});
      await prisma.bookingStatusHistory.deleteMany({});
      await prisma.booking.deleteMany({});
      await prisma.enquiry.deleteMany({});
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM analytics_events WHERE visitor_id LIKE '%test%'`);
        await prisma.$executeRawUnsafe(`DELETE FROM analytics_visitors WHERE visitor_id LIKE '%test%'`);
      } catch {
        // ignore
      }
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  };
}
