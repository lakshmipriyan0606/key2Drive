import { describe, it, expect } from 'vitest';
import {
  AdminLoginSchema,
  AdminSessionManager,
} from '@/../tests/contracts/authContract';
import {
  BookingLifecycleTracker,
  BookingStatus,
} from '@/../tests/contracts/lifecycleContract';

interface DashboardMetrics {
  total: number;
  requested: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

function computeMetrics(bookings: BookingLifecycleTracker[]): DashboardMetrics {
  const metrics: DashboardMetrics = {
    total: bookings.length,
    requested: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  bookings.forEach((b) => {
    const s = b.getStatus();
    if (s === 'REQUESTED') metrics.requested++;
    else if (s === 'CONFIRMED') metrics.confirmed++;
    else if (s === 'COMPLETED') metrics.completed++;
    else if (s === 'CANCELLED') metrics.cancelled++;
  });

  return metrics;
}

describe('Tier 4: Workload Scenario - Admin Review & Status Transition Flow', () => {
  it('executes end-to-end admin session, booking dispatch triage, note attachment, and status progression', () => {
    // Step 1: Admin logs in with credentials
    const credentials = {
      email: 'admin@key2drive.com',
      password: 'SuperAdmin@2026!',
    };
    const loginValidation = AdminLoginSchema.safeParse(credentials);
    expect(loginValidation.success).toBe(true);

    const sessionManager = new AdminSessionManager();
    const session = sessionManager.createSession('usr_lead_dispatcher', 'ADMIN');
    expect(session.token).toBeDefined();

    // Verify session guard
    const authCheck = sessionManager.verifySession(session.token);
    expect(authCheck.valid).toBe(true);
    expect(authCheck.session?.role).toBe('ADMIN');

    // Step 2: System has multiple bookings in initial state
    const booking1 = new BookingLifecycleTracker('K2D-20261101-0001', 'REQUESTED');
    const booking2 = new BookingLifecycleTracker('K2D-20261101-0002', 'REQUESTED');
    const booking3 = new BookingLifecycleTracker('K2D-20261101-0003', 'CONFIRMED');
    const allBookings = [booking1, booking2, booking3];

    // Step 3: Admin reviews overview metrics
    let metrics = computeMetrics(allBookings);
    expect(metrics.total).toBe(3);
    expect(metrics.requested).toBe(2);
    expect(metrics.confirmed).toBe(1);
    expect(metrics.completed).toBe(0);

    // Step 4: Admin filters by status === 'REQUESTED'
    const requestedList = allBookings.filter((b) => b.getStatus() === 'REQUESTED');
    expect(requestedList.length).toBe(2);

    // Step 5: Admin selects booking1, reviews route, and attaches internal dispatch note
    const targetBooking = booking1;
    const transitionToConfirmed = targetBooking.transition(
      'CONFIRMED',
      session.userId,
      'VIP client: assigned Chauffeur Ramesh Babu (Grade A, Luxury Certified)'
    );
    expect(transitionToConfirmed.valid).toBe(true);
    expect(targetBooking.getStatus()).toBe('CONFIRMED');

    // Metrics reflect confirmation
    metrics = computeMetrics(allBookings);
    expect(metrics.requested).toBe(1);
    expect(metrics.confirmed).toBe(2);

    // Step 6: Trip completed; admin updates status to COMPLETED
    const transitionToCompleted = targetBooking.transition(
      'COMPLETED',
      session.userId,
      'Trip concluded at 18:30. Zero incidents, customer rated 5/5 stars.'
    );
    expect(transitionToCompleted.valid).toBe(true);
    expect(targetBooking.getStatus()).toBe('COMPLETED');

    // Metrics reflect completion
    metrics = computeMetrics(allBookings);
    expect(metrics.requested).toBe(1);
    expect(metrics.confirmed).toBe(1);
    expect(metrics.completed).toBe(1);

    // Step 7: Verify complete audit trail of the booking
    const auditTrail = targetBooking.getHistory();
    expect(auditTrail.length).toBe(2);
    expect(auditTrail[0].changedBy).toBe(session.userId);
    expect(auditTrail[0].toStatus).toBe('CONFIRMED');
    expect(auditTrail[1].toStatus).toBe('COMPLETED');

    // Step 8: Admin logs out
    const loggedOut = sessionManager.invalidateSession(session.token);
    expect(loggedOut).toBe(true);
    expect(sessionManager.verifySession(session.token).valid).toBe(false);
  });
});
