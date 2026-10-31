import { describe, it, expect } from 'vitest';
import {
  validateBookingStatusTransition,
  BookingLifecycleTracker,
  ALLOWED_TRANSITIONS,
} from '@/../tests/contracts/lifecycleContract';

describe('Tier 1: Feature 22 - Booking Lifecycle State Machine Contract', () => {
  it('allows valid initial transitions from REQUESTED state', () => {
    const validTargets = ALLOWED_TRANSITIONS.REQUESTED;
    expect(validTargets).toContain('CONFIRMED');
    expect(validTargets).toContain('REJECTED');
    expect(validTargets).toContain('CANCELLED');

    validTargets.forEach((target) => {
      const res = validateBookingStatusTransition('REQUESTED', target);
      expect(res.valid).toBe(true);
      expect(res.statusCode).toBe(200);
    });
  });

  it('allows valid subsequent transitions from CONFIRMED state', () => {
    const validTargets = ALLOWED_TRANSITIONS.CONFIRMED;
    expect(validTargets).toContain('COMPLETED');
    expect(validTargets).toContain('CANCELLED');

    validTargets.forEach((target) => {
      const res = validateBookingStatusTransition('CONFIRMED', target);
      expect(res.valid).toBe(true);
      expect(res.statusCode).toBe(200);
    });
  });

  it('strictly rejects illegal direct jump: REQUESTED -> COMPLETED with HTTP 422', () => {
    const res = validateBookingStatusTransition('REQUESTED', 'COMPLETED');
    expect(res.valid).toBe(false);
    expect(res.statusCode).toBe(422);
    expect(res.error).toBe('Invalid status transition');
  });

  it('strictly rejects transition attempts from terminal COMPLETED state', () => {
    const targets: ('REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED')[] = [
      'REQUESTED',
      'CONFIRMED',
      'REJECTED',
      'CANCELLED',
    ];

    targets.forEach((target) => {
      const res = validateBookingStatusTransition('COMPLETED', target);
      expect(res.valid).toBe(false);
      expect(res.statusCode).toBe(422);
    });
  });

  it('strictly rejects transition attempts from terminal REJECTED state', () => {
    const res = validateBookingStatusTransition('REJECTED', 'CONFIRMED');
    expect(res.valid).toBe(false);
    expect(res.statusCode).toBe(422);
  });

  it('strictly rejects transition attempts from terminal CANCELLED state', () => {
    const res = validateBookingStatusTransition('CANCELLED', 'CONFIRMED');
    expect(res.valid).toBe(false);
    expect(res.statusCode).toBe(422);
  });

  it('BookingLifecycleTracker records chronological status history logs', () => {
    const tracker = new BookingLifecycleTracker('book_test_123', 'REQUESTED');
    expect(tracker.getStatus()).toBe('REQUESTED');
    expect(tracker.getHistory().length).toBe(0);

    // Transition 1: REQUESTED -> CONFIRMED
    const step1 = tracker.transition('CONFIRMED', 'admin@key2drive.com', 'Driver assigned');
    expect(step1.valid).toBe(true);
    expect(tracker.getStatus()).toBe('CONFIRMED');
    expect(tracker.getHistory().length).toBe(1);
    expect(tracker.getHistory()[0].fromStatus).toBe('REQUESTED');
    expect(tracker.getHistory()[0].toStatus).toBe('CONFIRMED');
    expect(tracker.getHistory()[0].note).toBe('Driver assigned');

    // Transition 2: CONFIRMED -> COMPLETED
    const step2 = tracker.transition('COMPLETED', 'admin@key2drive.com', 'Trip finished smoothly');
    expect(step2.valid).toBe(true);
    expect(tracker.getStatus()).toBe('COMPLETED');
    expect(tracker.getHistory().length).toBe(2);
    expect(tracker.getHistory()[1].fromStatus).toBe('CONFIRMED');
    expect(tracker.getHistory()[1].toStatus).toBe('COMPLETED');
  });

  it('BookingLifecycleTracker does not mutate status or history when transition is invalid', () => {
    const tracker = new BookingLifecycleTracker('book_test_456', 'REQUESTED');

    // Attempt illegal transition
    const failedStep = tracker.transition('COMPLETED', 'admin@key2drive.com');
    expect(failedStep.valid).toBe(false);
    expect(failedStep.statusCode).toBe(422);

    // Status remains unchanged
    expect(tracker.getStatus()).toBe('REQUESTED');
    expect(tracker.getHistory().length).toBe(0);
  });
});
