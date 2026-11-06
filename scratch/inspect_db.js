const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Current DB Counts ---');
  const [users, services, tariffs, bookings, enquiries, adminNotes] = await Promise.all([
    prisma.user.count(),
    prisma.service.count(),
    prisma.tariff.count(),
    prisma.booking.count(),
    prisma.enquiry.count(),
    prisma.adminNote.count(),
  ]);

  console.log('Users:', users);
  console.log('Services:', services);
  console.log('Tariffs:', tariffs);
  console.log('Bookings:', bookings);
  console.log('Enquiries:', enquiries);
  console.log('AdminNotes:', adminNotes);

  const enquiryList = await prisma.enquiry.findMany();
  console.log('\n--- Enquiries list ---');
  enquiryList.forEach(e => {
    console.log(`[${e.id}] Name: "${e.name}", Subject: "${e.subject}", Created: ${e.createdAt}`);
  });

  const bookingList = await prisma.booking.findMany();
  console.log('\n--- Bookings list ---');
  bookingList.forEach(b => {
    console.log(`[${b.reference}] Name: "${b.customerName}", Service: ${b.serviceId}, Status: ${b.status}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

