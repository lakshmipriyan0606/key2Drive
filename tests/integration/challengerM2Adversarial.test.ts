import { describe, it, expect, vi, beforeAll } from 'vitest';
import prisma from '@/lib/db';
import { POST as postBooking } from '@/app/api/bookings/route';
import { GET as getBooking } from '@/app/api/bookings/[id]/route';
import { PATCH as patchBookingStatus } from '@/app/api/admin/bookings/[id]/status/route';
import { POST as postEnquiry } from '@/app/api/enquiries/route';
import { POST as adminLogin } from '@/app/api/admin/auth/login/route';
import { GET as getAdminBookings } from '@/app/api/admin/bookings/route';
import * as authModule from '@/lib/auth';

describe('Challenger M2-2 Empirical Adversarial Suite', () => {
  let testServiceId: string;
  const mockAdminUser = {
    id: 'admin_challenger_001',
    email: 'admin@key2drive.com',
    name: 'Master Admin',
    role: 'ADMIN',
  };

  beforeAll(async () => {
    const srv = await prisma.service.findFirst({ where: { slug: 'hourly-driver' } });
    if (!srv) throw new Error('Seeded service hourly-driver not found');
    testServiceId = srv.id;
  });

  describe('1. Idempotency Lock Empirical Stress Tests', () => {
    it('enforces idempotency lock: duplicate submission within 5 min returns HTTP 200 with isDuplicate: true and creates exactly 1 DB record', async () => {
      const submissionHash = `challenger_idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      const payload = {
        customerName: 'Vikram Seth',
        customerPhone: '9876543210',
        customerEmail: 'vikram.seth@example.com',
        serviceId: testServiceId,
        pickupAddress: 'Sector 44, Gurgaon',
        dropAddress: 'Cyber City, DLF Phase 2',
        pickupDateTime: futureDate,
        duration: '4 hours',
        vehicleInfo: 'BMW 5 Series (AUTOMATIC, SEDAN)',
        specialInstructions: 'Please arrive 10 minutes prior.',
        estimatedAmount: 2499,
        submissionHash,
      };

      // First Submission -> 201 Created
      const req1 = new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res1 = await postBooking(req1);
      expect(res1.status).toBe(201);
      const data1 = await res1.json();
      expect(data1.success).toBe(true);
      expect(data1.bookingReference).toMatch(/^K2D-\d{8}-[A-Z0-9]{4}$/);
      expect(data1.status).toBe('REQUESTED');

      // Duplicate Submission with identical submissionHash -> 200 OK, isDuplicate: true
      const req2 = new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res2 = await postBooking(req2);
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.success).toBe(true);
      expect(data2.isDuplicate).toBe(true);
      expect(data2.bookingReference).toBe(data1.bookingReference);
      expect(data2.bookingId).toBe(data1.bookingId);

      // Verify exactly ONE database record exists for this submissionHash
      const count = await prisma.booking.count({
        where: { submissionHash },
      });
      expect(count).toBe(1);
    }, 15000);

    it('allows submission after 5-minute sliding window expires', async () => {
      const submissionHash = `challenger_exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      // 1. Manually insert an initial booking with createdAt = 6 minutes ago
      const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);
      const initialBooking = await prisma.booking.create({
        data: {
          reference: `K2D-PAST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          status: 'REQUESTED',
          customerName: 'Priya Sharma',
          customerPhone: '9812345678',
          customerEmail: 'priya@example.com',
          serviceId: testServiceId,
          pickupAddress: 'Connaught Place, New Delhi',
          pickupDateTime: new Date(Date.now() + 7200000),
          vehicleInfo: 'Honda City',
          estimatedAmount: 1800,
          submissionHash,
          createdAt: sixMinutesAgo,
        },
      });

      expect(initialBooking.id).toBeDefined();

      // 2. Submit new request with the SAME submissionHash
      const payload = {
        customerName: 'Priya Sharma',
        customerPhone: '9812345678',
        customerEmail: 'priya@example.com',
        serviceId: testServiceId,
        pickupAddress: 'Connaught Place, New Delhi',
        pickupDateTime: futureDate,
        duration: '4 hours',
        vehicleInfo: 'Honda City',
        estimatedAmount: 1800,
        submissionHash,
      };

      const req = new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await postBooking(req);
      // Because > 5 minutes passed, it should NOT be flagged as duplicate and should create a new record
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.isDuplicate).toBeUndefined();
      expect(data.bookingReference).not.toBe(initialBooking.reference);

      // Total records for this hash should now be 2
      const count = await prisma.booking.count({ where: { submissionHash } });
      expect(count).toBe(2);
    }, 15000);

    it('rejects booking submissions with missing or invalid submissionHash', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const badPayload = {
        customerName: 'Invalid Hash User',
        customerPhone: '9876543210',
        customerEmail: 'invalid@example.com',
        serviceId: testServiceId,
        pickupAddress: 'Test Address Road',
        pickupDateTime: futureDate,
        vehicleInfo: 'Toyota Camry',
        estimatedAmount: 1500,
        submissionHash: 'short', // Less than 8 chars
      };

      const req = new Request('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badPayload),
      });

      const res = await postBooking(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.details.submissionHash).toBeDefined();
    });
  });

  describe('2. Lifecycle State Machine Transitions & HTTP 422 Enforcement', () => {
    it('returns HTTP 401 Unauthorized when unauthenticated client attempts status transition', async () => {
      vi.spyOn(authModule, 'getAdminSession').mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/admin/bookings/fake-id/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      const res = await patchBookingStatus(req, {
        params: Promise.resolve({ id: 'fake-id' }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('rejects illegal status transitions with HTTP 422 and preserves database integrity', async () => {
      // Authenticate admin session for this test
      vi.spyOn(authModule, 'getAdminSession').mockResolvedValue({
        user: mockAdminUser,
        sessionId: 'sess_valid_123',
        token: 'tok_valid_123',
        expiresAt: new Date(Date.now() + 86400000),
      });

      // 1. Create a fresh booking in REQUESTED state
      const booking = await prisma.booking.create({
        data: {
          reference: `K2D-TRANS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          status: 'REQUESTED',
          customerName: 'Transit Challenger',
          customerPhone: '9876543210',
          customerEmail: 'transit@example.com',
          serviceId: testServiceId,
          pickupAddress: 'MG Road, Bangalore',
          pickupDateTime: new Date(Date.now() + 3600000),
          vehicleInfo: 'Audi A6',
          estimatedAmount: 3200,
          submissionHash: `transit_hash_${Date.now()}`,
        },
      });

      // CHALLENGE 1: REQUESTED -> COMPLETED (Illegal jump)
      const reqJump = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED', note: 'Attempting invalid jump' }),
      });

      const resJump = await patchBookingStatus(reqJump, {
        params: Promise.resolve({ id: booking.id }),
      });

      expect(resJump.status).toBe(422);
      const dataJump = await resJump.json();
      expect(dataJump.success).toBe(false);
      expect(dataJump.error).toContain("Invalid status transition from 'REQUESTED' to 'COMPLETED'");
      expect(dataJump.allowedTransitions).toEqual(['CONFIRMED', 'REJECTED', 'CANCELLED']);

      // Verify DB record status remained 'REQUESTED'
      const unchangedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
      expect(unchangedBooking?.status).toBe('REQUESTED');

      // CHALLENGE 2: REQUESTED -> REQUESTED (No-op transition)
      const reqNoOp = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REQUESTED' }),
      });
      const resNoOp = await patchBookingStatus(reqNoOp, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resNoOp.status).toBe(400);
      const dataNoOp = await resNoOp.json();
      expect(dataNoOp.error).toContain("already in 'REQUESTED' status");

      // VALID TRANSITION: REQUESTED -> CONFIRMED
      const reqConfirm = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED', note: 'Chauffeur assigned successfully' }),
      });
      const resConfirm = await patchBookingStatus(reqConfirm, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resConfirm.status).toBe(200);
      const dataConfirm = await resConfirm.json();
      expect(dataConfirm.booking.status).toBe('CONFIRMED');

      // CHALLENGE 3: CONFIRMED -> REQUESTED (Illegal backward transition)
      const reqBack = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REQUESTED' }),
      });
      const resBack = await patchBookingStatus(reqBack, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resBack.status).toBe(422);
      const dataBack = await resBack.json();
      expect(dataBack.error).toContain("Invalid status transition from 'CONFIRMED' to 'REQUESTED'");

      // VALID TRANSITION: CONFIRMED -> CANCELLED (Terminal state)
      const reqCancel = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', note: 'Customer emergency cancellation' }),
      });
      const resCancel = await patchBookingStatus(reqCancel, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resCancel.status).toBe(200);

      // CHALLENGE 4: CANCELLED -> CONFIRMED (Illegal transition from terminal state)
      const reqFromTerminal = new Request(`http://localhost:3000/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      const resFromTerminal = await patchBookingStatus(reqFromTerminal, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resFromTerminal.status).toBe(422);
      const dataFromTerminal = await resFromTerminal.json();
      expect(dataFromTerminal.error).toContain("Invalid status transition from 'CANCELLED' to 'CONFIRMED'");

      // Verify audit trail recorded all transitions accurately
      const history = await prisma.bookingStatusHistory.findMany({
        where: { bookingId: booking.id },
        orderBy: { createdAt: 'asc' },
      });
      expect(history.length).toBe(2);
      expect(history[0].fromStatus).toBe('REQUESTED');
      expect(history[0].toStatus).toBe('CONFIRMED');
      expect(history[1].fromStatus).toBe('CONFIRMED');
      expect(history[1].toStatus).toBe('CANCELLED');
    }, 15000);
  });

  describe('3. Public Booking Lookup PII Masking & Security', () => {
    it('masks phone numbers to "98******10" and emails to "a***@example.com" in public lookup', async () => {
      // Use customer phone distinct from Key2Drive default support number
      const customerRawPhone = '9845099887';
      const customerRawEmail = 'arun.kumar@example.com';
      const reference = `K2D-PII-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const booking = await prisma.booking.create({
        data: {
          reference,
          status: 'REQUESTED',
          customerName: 'Arun Kumar',
          customerPhone: customerRawPhone,
          customerEmail: customerRawEmail,
          serviceId: testServiceId,
          pickupAddress: 'Indiranagar 12th Main, Bangalore',
          pickupDateTime: new Date(Date.now() + 3600000),
          vehicleInfo: 'Toyota Fortuner',
          estimatedAmount: 2100,
          submissionHash: `pii_hash_${Date.now()}`,
        },
      });

      const req = new Request(`http://localhost:3000/api/bookings/${reference}`);
      const res = await getBooking(req, {
        params: Promise.resolve({ id: reference }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const serialized = JSON.stringify(data);

      // Verify PII is masked
      expect(data.booking.customerPhone).toBe('98******87');
      expect(data.booking.customerEmail).toBe('a***@example.com');

      // EMPIRICAL CHALLENGE: Verify the raw, unmasked customer phone and email NEVER appear in the response payload
      expect(serialized).not.toContain(customerRawPhone);
      expect(serialized).not.toContain(customerRawEmail);
    });

    it('handles lowercase reference and booking ID lookups safely', async () => {
      const reference = `K2D-CASE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const booking = await prisma.booking.create({
        data: {
          reference,
          status: 'REQUESTED',
          customerName: 'Case Sensitivity Tester',
          customerPhone: '9845012345',
          customerEmail: 'case.tester@key2drive.com',
          serviceId: testServiceId,
          pickupAddress: 'Koramangala 5th Block',
          pickupDateTime: new Date(Date.now() + 3600000),
          vehicleInfo: 'Honda Elevate',
          estimatedAmount: 1400,
          submissionHash: `case_hash_${Date.now()}`,
        },
      });

      // Query using lowercase reference
      const reqLower = new Request(`http://localhost:3000/api/bookings/${reference.toLowerCase()}`);
      const resLower = await getBooking(reqLower, {
        params: Promise.resolve({ id: reference.toLowerCase() }),
      });
      expect(resLower.status).toBe(200);
      const dataLower = await resLower.json();
      expect(dataLower.booking.reference).toBe(reference);

      // Query using booking ID
      const reqId = new Request(`http://localhost:3000/api/bookings/${booking.id}`);
      const resId = await getBooking(reqId, {
        params: Promise.resolve({ id: booking.id }),
      });
      expect(resId.status).toBe(200);
      const dataId = await resId.json();
      expect(dataId.booking.id).toBe(booking.id);
    });

    it('rejects invalid or non-existent identifiers with appropriate HTTP status codes', async () => {
      // Non-existent ID -> 404
      const req404 = new Request('http://localhost:3000/api/bookings/K2D-99999999-XXXX');
      const res404 = await getBooking(req404, {
        params: Promise.resolve({ id: 'K2D-99999999-XXXX' }),
      });
      expect(res404.status).toBe(404);
      const data404 = await res404.json();
      expect(data404.success).toBe(false);

      // Empty or whitespace ID -> 400
      const req400 = new Request('http://localhost:3000/api/bookings/%20');
      const res400 = await getBooking(req400, {
        params: Promise.resolve({ id: '   ' }),
      });
      expect(res400.status).toBe(400);
    });
  });

  describe('4. SQL & XSS Injection Payload Stress Harness', () => {
    it('safely stores SQL injection payloads in booking text fields without executing injection or corrupting database', async () => {
      const sqlPayloads = [
        "'; DROP TABLE \"Booking\"; --",
        "' OR '1'='1",
        "admin' --",
        "1' UNION SELECT username, password_hash FROM \"User\" --",
      ];

      for (const sql of sqlPayloads) {
        const submissionHash = `challenger_sql_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const payload = {
          customerName: `Safe User ${sql.substring(0, 10)}`,
          customerPhone: '9876543210',
          customerEmail: 'safesql@example.com',
          serviceId: testServiceId,
          pickupAddress: `Pickup Address with ${sql}`,
          pickupDateTime: new Date(Date.now() + 3600000).toISOString(),
          duration: '4 hours',
          vehicleInfo: 'Hyundai Verna',
          specialInstructions: `Instructions containing ${sql}`,
          estimatedAmount: 1500,
          submissionHash,
        };

        const req = new Request('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const res = await postBooking(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);

        // Verify record exists and table is NOT dropped
        const record = await prisma.booking.findUnique({
          where: { id: data.bookingId },
        });
        expect(record).toBeDefined();
        expect(record?.pickupAddress).toContain(sql);
        expect(record?.specialInstructions).toContain(sql);
      }

      // Verify Booking table count remains healthy
      const totalBookings = await prisma.booking.count();
      expect(totalBookings).toBeGreaterThan(0);
    }, 15000);

    it('safely encapsulates XSS payloads in customer enquiries without execution', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '<svg/onload=alert(document.cookie)>',
      ];

      for (const xss of xssPayloads) {
        const payload = {
          name: 'XSS Challenger',
          phone: '9876543210',
          email: 'xss@example.com',
          subject: `Inquiry with ${xss.substring(0, 15)}`,
          message: `Testing message containing malicious script: ${xss}`,
        };

        const req = new Request('http://localhost:3000/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const res = await postEnquiry(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);

        const savedEnquiry = await prisma.enquiry.findUnique({
          where: { id: data.enquiryId },
        });
        expect(savedEnquiry).toBeDefined();
        expect(savedEnquiry?.message).toContain(xss);
      }
    });

    it('rejects SQL injection in admin login credentials with HTTP 401 and zero authentication bypass', async () => {
      const injectionAttempts = [
        { email: "admin@key2drive.com' OR '1'='1", password: "' OR '1'='1" },
        { email: "admin@key2drive.com'; DROP TABLE \"User\"; --", password: "password" },
        { email: "admin@key2drive.com", password: "' OR 1=1 --" },
      ];

      for (const attempt of injectionAttempts) {
        const req = new Request('http://localhost:3000/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt),
        });

        const res = await adminLogin(req);
        // Either 400 (if email format rejected by Zod) or 401 (invalid credentials). Never 200!
        expect([400, 401]).toContain(res.status);
        const data = await res.json();
        expect(data.success).toBe(false);
      }

      // Ensure User table was NOT corrupted or dropped
      const userCount = await prisma.user.count();
      expect(userCount).toBeGreaterThanOrEqual(1);
    });

    it('handles SQL injection attempts in admin booking search queries gracefully without crashing', async () => {
      vi.spyOn(authModule, 'getAdminSession').mockResolvedValue({
        user: {
          id: 'admin_challenger_002',
          email: 'admin@key2drive.com',
          name: 'Master Admin',
          role: 'ADMIN',
        },
        sessionId: 'sess_valid_search',
        token: 'tok_valid_search',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const maliciousSearch = "'; DROP TABLE \"Booking\"; --";
      const req = new Request(
        `http://localhost:3000/api/admin/bookings?search=${encodeURIComponent(maliciousSearch)}`
      );

      const res = await getAdminBookings(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.bookings)).toBe(true);

      // Verify DB still healthy
      const postSearchCount = await prisma.booking.count();
      expect(postSearchCount).toBeGreaterThan(0);
    });
  });
});
