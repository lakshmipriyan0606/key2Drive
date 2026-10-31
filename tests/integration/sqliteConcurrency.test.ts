import { describe, it, expect } from 'vitest';
import prisma from '@/lib/db';
import { POST as postBooking } from '@/app/api/bookings/route';

describe('Empirical SQLite Concurrency, Connection Pooling & Pragmas Challenge', () => {
  it('inspects SQLite journal_mode and busy_timeout pragmas', async () => {
    const journalModeResult = await prisma.$queryRawUnsafe<{ journal_mode: string }[]>('PRAGMA journal_mode;');
    const busyTimeoutResult = await prisma.$queryRawUnsafe<{ timeout: number }[]>('PRAGMA busy_timeout;');

    console.log('Empirical SQLite Pragmas:', {
      journal_mode: journalModeResult[0]?.journal_mode,
      busy_timeout: busyTimeoutResult[0]?.timeout,
    });

    expect(journalModeResult).toBeDefined();
    expect(journalModeResult[0]?.journal_mode).toBeDefined();
  });

  it('handles 100 simultaneous parallel read queries without SQLITE_BUSY or connection pool exhaustion', async () => {
    const tasks = Array.from({ length: 100 }, (_, i) => {
      const remainder = i % 5;
      if (remainder === 0) return prisma.service.findMany({ include: { tariffs: true } });
      if (remainder === 1) return prisma.tariff.findMany();
      if (remainder === 2) return prisma.user.findMany();
      if (remainder === 3) return prisma.booking.findMany({ take: 5 });
      return prisma.enquiry.findMany({ take: 5 });
    });

    const startTime = performance.now();
    const results = await Promise.all(tasks);
    const durationMs = performance.now() - startTime;

    console.log(`100 parallel read queries completed in ${durationMs.toFixed(2)}ms`);
    expect(results.length).toBe(100);
    for (const res of results) {
      expect(res).toBeDefined();
      expect(Array.isArray(res)).toBe(true);
    }
  });

  it('handles 10 simultaneous parallel interactive transactions (POST /api/bookings) with zero SQLITE_BUSY errors', async () => {
    const service = await prisma.service.findFirst({ where: { slug: 'hourly-driver' } });
    expect(service).toBeDefined();

    const timestamp = Date.now();
    const bookingTasks = Array.from({ length: 10 }, (_, i) => {
      const payload = {
        customerName: `Concurrent Challenger User ${i}`,
        customerPhone: `98765432${(i % 100).toString().padStart(2, '0')}`,
        customerEmail: `challenger_${i}_${timestamp}@test.com`,
        serviceId: service!.id,
        pickupAddress: `Challenger Pickup Spot #${i}, MG Road, Bangalore`,
        dropAddress: 'Koramangala 5th Block',
        pickupDateTime: new Date(timestamp + (i + 1) * 3600 * 1000).toISOString(),
        duration: '4 hours',
        vehicleInfo: {
          make: 'Hyundai',
          model: 'Creta',
          transmission: 'AUTOMATIC',
          category: 'SUV',
        },
        specialInstructions: `Empirical concurrency challenge item ${i}`,
        estimatedAmount: 1596,
        submissionHash: `challenger_hash_${timestamp}_${i}`,
      };

      const req = new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return postBooking(req);
    });

    const startTime = performance.now();
    const responses = await Promise.all(bookingTasks);
    const durationMs = performance.now() - startTime;

    console.log(`10 simultaneous interactive transaction bookings completed in ${durationMs.toFixed(2)}ms`);

    const references: string[] = [];
    for (const res of responses) {
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.bookingReference).toBeDefined();
      expect(references.includes(json.bookingReference)).toBe(false); // All references must be unique
      references.push(json.bookingReference);
    }

    expect(references.length).toBe(10);

    // Clean up created bookings
    const deleted = await prisma.booking.deleteMany({
      where: {
        reference: { in: references },
      },
    });
    console.log(`Cleaned up ${deleted.count} concurrent challenge bookings`);
  }, 20000);

  it('handles 40 mixed simultaneous reads and writes interleaved', async () => {
    const mixedTasks = Array.from({ length: 40 }, (_, i) => {
      if (i % 3 === 0) {
        // Write task
        return prisma.enquiry.create({
          data: {
            name: `Mixed Test User ${i}`,
            phone: '9988776655',
            email: `mixed_${i}_${Date.now()}@example.com`,
            subject: `Mixed Concurrency Test ${i}`,
            message: 'Mixed stress payload',
            status: 'PENDING',
          },
        });
      } else if (i % 3 === 1) {
        // Read services with tariffs
        return prisma.service.findMany({ include: { tariffs: true } });
      } else {
        // Read bookings with service
        return prisma.booking.findMany({ include: { service: true } });
      }
    });

    const startTime = performance.now();
    const results = await Promise.all(mixedTasks);
    const durationMs = performance.now() - startTime;

    console.log(`40 mixed read/write tasks completed in ${durationMs.toFixed(2)}ms`);
    expect(results.length).toBe(40);

    // Clean up
    await prisma.enquiry.deleteMany({
      where: { subject: { startsWith: 'Mixed Concurrency Test' } },
    });
  }, 20000);

  it('empirically verifies unconfirmed rate tagging on all tariffs', async () => {
    const allTariffs = await prisma.tariff.findMany();
    expect(allTariffs.length).toBe(9);

    for (const tariff of allTariffs) {
      expect(tariff.isUnconfirmed).toBe(true);
      expect(tariff.title).toContain('[Pending Client Review]');
    }
  });
});
