import { describe, it, expect } from 'vitest';
import prisma from '@/lib/db';
import { GET as getServices } from '@/app/api/services/route';
import { POST as postBooking } from '@/app/api/bookings/route';
import { GET as getBooking } from '@/app/api/bookings/[id]/route';
import { POST as postEnquiry } from '@/app/api/enquiries/route';
import { GET as getTariffs } from '@/app/api/tariffs/route';
import { messagingService } from '@/lib/integrations/messaging';
import { mapsService } from '@/lib/integrations/maps';
import { paymentService } from '@/lib/integrations/payment';

describe('Milestone 2 API Routes & Integrations Integration Suite', () => {
  it('GET /api/services returns seeded chauffeur services with tariffs', async () => {
    const req = new Request('http://localhost:3000/api/services');
    const res = await getServices(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(6);
    expect(data.services.length).toBe(6);

    const hourly = data.services.find((s: any) => s.slug === 'hourly-driver');
    expect(hourly).toBeDefined();
    expect(hourly.tariffs.length).toBeGreaterThanOrEqual(1);
    expect(hourly.tariffs[0].isUnconfirmed).toBe(true);
    expect(hourly.tariffs[0].title).toContain('[Pending Client Review]');
  });

  it('GET /api/tariffs returns tariffs filtered by service slug', async () => {
    const req = new Request('http://localhost:3000/api/tariffs?service=hourly-driver');
    const res = await getTariffs(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.tariffs.length).toBe(2);
    expect(data.tariffs[0].service.slug).toBe('hourly-driver');
  });

  it('POST /api/bookings creates booking and enforces idempotency', async () => {
    const service = await prisma.service.findFirst({ where: { slug: 'hourly-driver' } });
    expect(service).toBeDefined();

    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const submissionHash = `integration_hash_${Date.now()}`;

    const bookingPayload = {
      customerName: 'Anand Ranganathan',
      customerPhone: '+91 98765 43210',
      customerEmail: 'anand@example.com',
      serviceId: service!.id,
      pickupAddress: '42 MG Road, Bangalore',
      dropAddress: 'Indiranagar 100ft Road',
      pickupDateTime: futureDate,
      duration: '4 hours',
      vehicleInfo: {
        make: 'Honda',
        model: 'City',
        transmission: 'AUTOMATIC',
        category: 'SEDAN',
      },
      specialInstructions: 'Punctual arrival required for business meeting',
      estimatedAmount: 1596,
      submissionHash,
    };

    const req1 = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });

    const res1 = await postBooking(req1);
    expect(res1.status).toBe(201);
    const data1 = await res1.json();
    expect(data1.success).toBe(true);
    expect(data1.bookingReference).toMatch(/^K2D-\d{8}-[A-Z0-9]{4}$/);
    expect(data1.status).toBe('REQUESTED');

    // Duplicate submission with same submissionHash returns HTTP 200 with isDuplicate: true
    const req2 = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });

    const res2 = await postBooking(req2);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.isDuplicate).toBe(true);
    expect(data2.bookingReference).toBe(data1.bookingReference);

    // Verify lookup via GET /api/bookings/[id]
    const getReq = new Request(`http://localhost:3000/api/bookings/${data1.bookingReference}`);
    const getRes = await getBooking(getReq, {
      params: Promise.resolve({ id: data1.bookingReference }),
    });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.booking.reference).toBe(data1.bookingReference);
    expect(getData.booking.customerName).toBe('Anand Ranganathan');
    expect(getData.booking.customerPhone).toContain('******'); // Phone masked
    expect(getData.booking.customerEmail).toContain('***@'); // Email masked
  });

  it('POST /api/enquiries submits customer enquiry and returns WhatsApp link', async () => {
    const enquiryPayload = {
      name: 'Dr. Vikram Sarabhai',
      phone: '9845012345',
      email: 'vikram@example.com',
      subject: 'Outstation chauffeur service inquiry',
      message: 'Need experienced highway chauffeur for 3-day trip from Bangalore to Coorg.',
    };

    const req = new Request('http://localhost:3000/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload),
    });

    const res = await postEnquiry(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.enquiryId).toBeDefined();
    expect(data.whatsappLink).toContain('https://wa.me/');
  });

  it('Mock services operate with deterministic accuracy', async () => {
    // Messaging
    const whatsappLink = messagingService.generateWhatsAppLink('9876543210', 'Test message');
    expect(whatsappLink).toBe('https://wa.me/919876543210?text=Test%20message');

    // Maps
    const zone = mapsService.validateLocation('Kempegowda International Airport Terminal 2');
    expect(zone.isValid).toBe(true);
    expect(zone.zone).toBe('AIRPORT_ZONE');

    const fare = mapsService.calculateFare({
      baseRate: 1899,
      includedHours: 8,
      includedKm: 80,
      extraHourRate: 149,
      extraKmRate: 12,
      nightChargeRate: 250,
      actualDurationHours: 10,
      estimatedDistanceKm: 100,
      pickupDateTime: '2026-11-01T23:30:00.000Z',
    });
    expect(fare.baseFare).toBe(1899);
    expect(fare.extraHourFare).toBe(2 * 149);
    expect(fare.extraKmFare).toBe(20 * 12);
    expect(fare.nightCharge).toBe(250);
    expect(fare.totalFare).toBe(1899 + 298 + 240 + 250);

    // Payments
    const order = await paymentService.createPaymentOrder({
      bookingReference: 'K2D-TEST-0001',
      amount: 2500,
      customerEmail: 'test@example.com',
      customerPhone: '9876543210',
    });
    expect(order.orderId).toBeDefined();
    expect(order.amount).toBe(2500);

    const verifySuccess = await paymentService.verifyPayment({
      orderId: order.orderId,
      paymentId: 'pay_valid_123',
      signature: 'sig_valid_123',
    });
    expect(verifySuccess.verified).toBe(true);
    expect(verifySuccess.status).toBe('CAPTURED');
  });
});
