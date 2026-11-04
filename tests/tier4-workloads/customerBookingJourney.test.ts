import { describe, it, expect, beforeEach } from 'vitest';
import {
  BookingCreateSchema,
  generateBookingReference,
  computeSubmissionHash,
  IdempotencyManager,
} from '@/../tests/contracts/bookingContract';
import { calculateFare, CHAUFFEUR_SERVICES } from '@/../tests/contracts/tariffContract';
import {
  MockMapsService,
  MockMessagingService,
} from '@/../tests/contracts/mockBoundariesContract';
import { BookingLifecycleTracker } from '@/../tests/contracts/lifecycleContract';

describe('Tier 4: Workload Scenario - End-to-End Customer Booking Flow', () => {
  let idempotencyManager: IdempotencyManager;
  let mapsService: MockMapsService;
  let messagingService: MockMessagingService;

  beforeEach(() => {
    idempotencyManager = new IdempotencyManager();
    mapsService = new MockMapsService();
    messagingService = new MockMessagingService();
  });

  it('completes the entire customer journey from service selection to booking confirmation & notification', async () => {
    // Step 1: Customer browses services and selects 'hourly-driver'
    const selectedService = CHAUFFEUR_SERVICES.find((s) => s.slug === 'hourly-driver');
    expect(selectedService).toBeDefined();
    expect(selectedService?.isActive).toBe(true);

    // Step 2: Route estimation between pickup and destination
    const pickupAddress = 'Taj Krishna, Banjara Hills, Hyderabad';
    const dropAddress = 'Rajiv Gandhi International Airport, Shamshabad';
    const routeEstimate = await mapsService.getRouteEstimate(pickupAddress, dropAddress);
    expect(routeEstimate.status).toBe('OK');
    expect(routeEstimate.distanceKm).toBeGreaterThan(0);
    expect(routeEstimate.durationMinutes).toBeGreaterThan(0);

    // Step 3: Fare preview calculation
    const pickupDateObj = new Date(Date.now() + 48 * 3600 * 1000);
    pickupDateObj.setHours(11, 0, 0, 0);
    const requestedPickupTime = pickupDateObj.toISOString(); // 2 days in future at 11:00 AM (daytime)
    const requestedDuration = 6; // 4 hrs base + 2 extra hours
    const farePreview = calculateFare({
      serviceId: selectedService!.id,
      durationHours: requestedDuration,
      pickupDateTime: requestedPickupTime,
      waitingMinutes: 0,
    });

    expect(farePreview.baseFare).toBe(4 * 399);
    expect(farePreview.extraHours).toBe(2);
    expect(farePreview.totalFare).toBe(4 * 399 + 2 * 99);

    // Step 4: Customer submits booking form
    const bookingInput = {
      customerName: 'Pooja Hegde',
      customerPhone: '9848099887',
      customerEmail: 'pooja.hegde@example.com',
      serviceId: selectedService!.id,
      pickupAddress,
      dropAddress,
      pickupDateTime: requestedPickupTime,
      duration: requestedDuration,
      vehicleInfo: 'BMW 5 Series',
      specialInstructions: 'Client traveling with elderly passenger. Gentle driving requested.',
    };

    // Client/Server validation
    const validationResult = BookingCreateSchema.safeParse(bookingInput);
    expect(validationResult.success).toBe(true);

    // Step 5: Double-submit idempotency check
    const submissionHash = computeSubmissionHash(bookingInput);
    const bookingReference = generateBookingReference(new Date(requestedPickupTime), 501);

    const lockResult = idempotencyManager.checkAndLock(submissionHash, bookingReference);
    expect(lockResult.isDuplicate).toBe(false);

    // Step 6: Booking record created with REQUESTED status
    const bookingTracker = new BookingLifecycleTracker(bookingReference, 'REQUESTED');
    expect(bookingTracker.getStatus()).toBe('REQUESTED');

    // Step 7: Automated messaging notification triggered
    const msgResult = await messagingService.sendNotification(
      'WHATSAPP',
      bookingInput.customerPhone,
      'BOOKING_RECEIVED',
      {
        reference: bookingReference,
        name: bookingInput.customerName,
        fare: String(farePreview.totalFare),
      }
    );
    expect(msgResult.success).toBe(true);
    expect(messagingService.getHistory()).toHaveLength(1);
    expect(messagingService.getHistory()[0].variables.reference).toBe(bookingReference);

    // Step 8: Subsequent immediate retry with same payload is caught by idempotency lock
    const duplicateLock = idempotencyManager.checkAndLock(submissionHash, bookingReference);
    expect(duplicateLock.isDuplicate).toBe(true);
    expect(duplicateLock.existingReference).toBe(bookingReference);
  });
});
