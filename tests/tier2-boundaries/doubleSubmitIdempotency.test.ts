import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeSubmissionHash,
  generateBookingReference,
  IdempotencyManager,
} from '@/../tests/contracts/bookingContract';

describe('Tier 2: Boundary - Double-Submit Idempotency Lock', () => {
  let manager: IdempotencyManager;

  beforeEach(() => {
    manager = new IdempotencyManager();
  });

  const payloadA = {
    customerPhone: '9876543210',
    serviceId: 'srv_hourly',
    pickupDateTime: '2026-11-01T10:00:00.000Z',
  };

  const payloadB = {
    customerPhone: '9848012345', // Different phone
    serviceId: 'srv_hourly',
    pickupDateTime: '2026-11-01T10:00:00.000Z',
  };

  it('allows the initial booking submission and locks the hash', () => {
    const hash = computeSubmissionHash(payloadA);
    const ref = generateBookingReference(new Date('2026-11-01'), 1);

    const check = manager.checkAndLock(hash, ref, 300000); // 5-minute TTL
    expect(check.isDuplicate).toBe(false);
    expect(check.existingReference).toBeUndefined();
  });

  it('detects immediate duplicate submission within 5-minute window and returns existing reference', () => {
    const hash = computeSubmissionHash(payloadA);
    const ref1 = generateBookingReference(new Date('2026-11-01'), 101);

    // Initial submission
    manager.checkAndLock(hash, ref1, 300000);

    // Immediate second submission with identical payload
    const ref2 = generateBookingReference(new Date('2026-11-01'), 102);
    const secondCheck = manager.checkAndLock(hash, ref2, 300000);

    expect(secondCheck.isDuplicate).toBe(true);
    expect(secondCheck.existingReference).toBe(ref1);
  });

  it('allows distinct customers with different phones to submit simultaneously without conflict', () => {
    const hashA = computeSubmissionHash(payloadA);
    const hashB = computeSubmissionHash(payloadB);
    expect(hashA).not.toBe(hashB);

    const refA = generateBookingReference(new Date('2026-11-01'), 201);
    const refB = generateBookingReference(new Date('2026-11-01'), 202);

    const checkA = manager.checkAndLock(hashA, refA);
    const checkB = manager.checkAndLock(hashB, refB);

    expect(checkA.isDuplicate).toBe(false);
    expect(checkB.isDuplicate).toBe(false);
  });

  it('releases idempotency lock after TTL expiration', () => {
    const hash = computeSubmissionHash(payloadA);
    const ref1 = generateBookingReference(new Date('2026-11-01'), 301);

    // Lock with negative TTL to simulate expired window
    manager.checkAndLock(hash, ref1, -1000);

    // New submission after expiration
    const ref2 = generateBookingReference(new Date('2026-11-01'), 302);
    const check = manager.checkAndLock(hash, ref2, 300000);

    expect(check.isDuplicate).toBe(false);
  });
});
