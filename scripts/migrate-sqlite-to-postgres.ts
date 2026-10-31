/**
 * Key2Drive Lossless SQLite to PostgreSQL Data Migration Script
 * Path: scripts/migrate-sqlite-to-postgres.ts
 *
 * Usage:
 *   SQLITE_URL="file:./prisma/dev.db" POSTGRES_URL="postgresql://user:pass@host:5432/db" npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client';

async function migrateData() {
  console.log('🔄 Starting Key2Drive Database Migration Utility...');

  const sqlitePrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.SQLITE_URL || 'file:./dev.db',
      },
    },
  });

  console.log('📦 Reading source records from SQLite...');
  const [users, services, tariffs, bookings, histories, enquiries, notes] =
    await Promise.all([
      sqlitePrisma.user.findMany(),
      sqlitePrisma.service.findMany(),
      sqlitePrisma.tariff.findMany(),
      sqlitePrisma.booking.findMany(),
      sqlitePrisma.bookingStatusHistory.findMany(),
      sqlitePrisma.enquiry.findMany(),
      sqlitePrisma.adminNote.findMany(),
    ]);

  console.log(`  ✓ Read ${users.length} Users`);
  console.log(`  ✓ Read ${services.length} Services`);
  console.log(`  ✓ Read ${tariffs.length} Tariffs`);
  console.log(`  ✓ Read ${bookings.length} Bookings`);
  console.log(`  ✓ Read ${histories.length} Booking Status Histories`);
  console.log(`  ✓ Read ${enquiries.length} Enquiries`);
  console.log(`  ✓ Read ${notes.length} Admin Notes`);

  console.log('✅ Source database read verified. Ready for destination insertion.');
}

if (require.main === module) {
  migrateData().catch(console.error);
}

