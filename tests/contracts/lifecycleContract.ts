export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface BookingStatusTransitionResult {
  valid: boolean;
  statusCode: number;
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  error?: string;
}

export interface BookingStatusHistoryEntry {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

/**
 * Authoritative map of allowed status transitions from PROJECT.md § Interface Contracts
 */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  REQUESTED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [], // Terminal state
  CANCELLED: [], // Terminal state
  COMPLETED: [], // Terminal state
};

/**
 * Validate a proposed booking status transition
 */
export function validateBookingStatusTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): BookingStatusTransitionResult {
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  if (allowed.includes(toStatus)) {
    return {
      valid: true,
      statusCode: 200,
      fromStatus,
      toStatus,
    };
  }

  return {
    valid: false,
    statusCode: 422,
    fromStatus,
    toStatus,
    error: 'Invalid status transition',
  };
}

/**
 * Booking Lifecycle State Machine Tracker
 */
export class BookingLifecycleTracker {
  private currentStatus: BookingStatus;
  private readonly bookingId: string;
  private history: BookingStatusHistoryEntry[] = [];

  constructor(bookingId: string, initialStatus: BookingStatus = 'REQUESTED') {
    this.bookingId = bookingId;
    this.currentStatus = initialStatus;
  }

  public getStatus(): BookingStatus {
    return this.currentStatus;
  }

  public getHistory(): readonly BookingStatusHistoryEntry[] {
    return [...this.history];
  }

  public transition(
    newStatus: BookingStatus,
    changedBy: string = 'admin@key2drive.com',
    note?: string
  ): BookingStatusTransitionResult {
    const result = validateBookingStatusTransition(this.currentStatus, newStatus);
    if (!result.valid) {
      return result;
    }

    const historyEntry: BookingStatusHistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      bookingId: this.bookingId,
      fromStatus: this.currentStatus,
      toStatus: newStatus,
      changedBy,
      note,
      createdAt: new Date().toISOString(),
    };

    this.history.push(historyEntry);
    this.currentStatus = newStatus;

    return result;
  }
}
