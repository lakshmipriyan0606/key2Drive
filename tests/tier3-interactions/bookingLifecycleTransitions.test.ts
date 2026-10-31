import { describe, it, expect } from 'vitest';
import {
  BookingLifecycleTracker,
  validateBookingStatusTransition,
} from '@/../tests/contracts/lifecycleContract';

describe('Tier 3: Interaction - Booking Lifecycle Transitions & Audit History', () => {
  it('executes the full happy path lifecycle: REQUESTED -> CONFIRMED -> COMPLETED', () => {
    const tracker = new BookingLifecycleTracker('bk_lifecycle_001', 'REQUESTED');

    // 1. Customer initiates: Status is REQUESTED
    expect(tracker.getStatus()).toBe('REQUESTED');

    // 2. Admin reviews and confirms booking
    const confirmStep = tracker.transition(
      'CONFIRMED',
      'dispatcher@key2drive.com',
      'Assigned Chauffeur Suresh K. (Badge #K2D-441)'
    );
    expect(confirmStep.valid).toBe(true);
    expect(confirmStep.statusCode).toBe(200);
    expect(tracker.getStatus()).toBe('CONFIRMED');

    // 3. Driver completes duty
    const completeStep = tracker.transition(
      'COMPLETED',
      'dispatcher@key2drive.com',
      'Duty finished. Customer signed OTP verification.'
    );
    expect(completeStep.valid).toBe(true);
    expect(completeStep.statusCode).toBe(200);
    expect(tracker.getStatus()).toBe('COMPLETED');

    // Audit trail verification
    const history = tracker.getHistory();
    expect(history.length).toBe(2);

    expect(history[0].fromStatus).toBe('REQUESTED');
    expect(history[0].toStatus).toBe('CONFIRMED');
    expect(history[0].changedBy).toBe('dispatcher@key2drive.com');
    expect(history[0].note).toContain('Suresh K.');

    expect(history[1].fromStatus).toBe('CONFIRMED');
    expect(history[1].toStatus).toBe('COMPLETED');
    expect(history[1].changedBy).toBe('dispatcher@key2drive.com');
    expect(history[1].note).toContain('OTP verification');

    // Ensure chronological order
    expect(new Date(history[1].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(history[0].createdAt).getTime()
    );
  });

  it('handles cancellation from REQUESTED state and records audit reason', () => {
    const tracker = new BookingLifecycleTracker('bk_cancel_001', 'REQUESTED');

    const step = tracker.transition(
      'CANCELLED',
      'customer_self_service',
      'Customer changed travel schedule'
    );
    expect(step.valid).toBe(true);
    expect(tracker.getStatus()).toBe('CANCELLED');

    const history = tracker.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].fromStatus).toBe('REQUESTED');
    expect(history[0].toStatus).toBe('CANCELLED');
    expect(history[0].note).toContain('changed travel schedule');
  });

  it('handles cancellation from CONFIRMED state with admin reason', () => {
    const tracker = new BookingLifecycleTracker('bk_cancel_002', 'REQUESTED');
    tracker.transition('CONFIRMED', 'admin@key2drive.com');

    const cancelStep = tracker.transition(
      'CANCELLED',
      'admin@key2drive.com',
      'Vehicle breakdown reported; driver reassignment declined by client'
    );
    expect(cancelStep.valid).toBe(true);
    expect(tracker.getStatus()).toBe('CANCELLED');
  });

  it('handles rejection from REQUESTED state with capacity reason', () => {
    const tracker = new BookingLifecycleTracker('bk_reject_001', 'REQUESTED');

    const rejectStep = tracker.transition(
      'REJECTED',
      'admin@key2drive.com',
      'Zero chauffeur availability for requested peak festival slot'
    );
    expect(rejectStep.valid).toBe(true);
    expect(tracker.getStatus()).toBe('REJECTED');
  });

  it('enforces HTTP 422 contract on illegal transitions and preserves state', () => {
    const tracker = new BookingLifecycleTracker('bk_illegal_001', 'REQUESTED');

    // Attempt illegal jump: REQUESTED -> COMPLETED
    const jumpRes = tracker.transition('COMPLETED', 'admin@key2drive.com');
    expect(jumpRes.valid).toBe(false);
    expect(jumpRes.statusCode).toBe(422);
    expect(jumpRes.error).toBe('Invalid status transition');
    expect(tracker.getStatus()).toBe('REQUESTED');

    // Transition legitimately to CONFIRMED
    tracker.transition('CONFIRMED', 'admin@key2drive.com');

    // Attempt illegal transition: CONFIRMED -> REJECTED
    const rejRes = tracker.transition('REJECTED', 'admin@key2drive.com');
    expect(rejRes.valid).toBe(false);
    expect(rejRes.statusCode).toBe(422);
    expect(tracker.getStatus()).toBe('CONFIRMED');

    // Transition legitimately to COMPLETED
    tracker.transition('COMPLETED', 'admin@key2drive.com');

    // Attempt illegal transition from terminal COMPLETED -> CANCELLED
    const termRes = tracker.transition('CANCELLED', 'admin@key2drive.com');
    expect(termRes.valid).toBe(false);
    expect(termRes.statusCode).toBe(422);
    expect(tracker.getStatus()).toBe('COMPLETED');
  });

  it('validates transition contract against all possible matrix combinations', () => {
    // REQUESTED
    expect(validateBookingStatusTransition('REQUESTED', 'CONFIRMED').valid).toBe(true);
    expect(validateBookingStatusTransition('REQUESTED', 'REJECTED').valid).toBe(true);
    expect(validateBookingStatusTransition('REQUESTED', 'CANCELLED').valid).toBe(true);
    expect(validateBookingStatusTransition('REQUESTED', 'COMPLETED').valid).toBe(false);

    // CONFIRMED
    expect(validateBookingStatusTransition('CONFIRMED', 'COMPLETED').valid).toBe(true);
    expect(validateBookingStatusTransition('CONFIRMED', 'CANCELLED').valid).toBe(true);
    expect(validateBookingStatusTransition('CONFIRMED', 'REQUESTED').valid).toBe(false);
    expect(validateBookingStatusTransition('CONFIRMED', 'REJECTED').valid).toBe(false);

    // Terminal states
    const terminals: ('REJECTED' | 'CANCELLED' | 'COMPLETED')[] = ['REJECTED', 'CANCELLED', 'COMPLETED'];
    terminals.forEach((term) => {
      const anyNext = validateBookingStatusTransition(term, 'CONFIRMED');
      expect(anyNext.valid).toBe(false);
      expect(anyNext.statusCode).toBe(422);
    });
  });
});
