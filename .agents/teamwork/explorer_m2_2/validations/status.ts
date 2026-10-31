import { z } from "zod";

/**
 * Booking Lifecycle Status Enum
 */
export const BookingStatusEnum = z.enum([
  "REQUESTED",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export type BookingStatus = z.infer<typeof BookingStatusEnum>;

/**
 * Strict state machine mapping allowed transitions for Key2Drive bookings:
 * - REQUESTED -> CONFIRMED | REJECTED | CANCELLED
 * - CONFIRMED -> COMPLETED | CANCELLED
 * - REJECTED -> Terminal state (no transitions allowed)
 * - CANCELLED -> Terminal state (no transitions allowed)
 * - COMPLETED -> Terminal state (no transitions allowed)
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  REQUESTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
} as const;

export const TERMINAL_STATUSES: readonly BookingStatus[] = [
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
] as const;

/**
 * Checks if a requested status transition is allowed by the lifecycle state machine.
 */
export function isValidStatusTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): boolean {
  if (fromStatus === toStatus) return false;
  const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

/**
 * Returns list of allowed next statuses for a given booking status.
 */
export function getAllowedNextStatuses(
  currentStatus: BookingStatus
): readonly BookingStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Zod schema enforcing valid status transitions with descriptive error messages.
 */
export const BookingStatusTransitionSchema = z
  .object({
    currentStatus: BookingStatusEnum,
    nextStatus: BookingStatusEnum,
    note: z
      .string()
      .trim()
      .max(500, "Transition note cannot exceed 500 characters")
      .optional()
      .nullable(),
    changedBy: z
      .string()
      .trim()
      .min(1, "Actor identifier ('changedBy') is required")
      .default("ADMIN"),
    finalAmount: z
      .number()
      .positive("Final amount must be greater than zero")
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.currentStatus === data.nextStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Booking is already in '${data.currentStatus}' status. No transition needed.`,
        path: ["nextStatus"],
      });
      return;
    }

    if (!isValidStatusTransition(data.currentStatus, data.nextStatus)) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[data.currentStatus];
      const detail =
        allowed.length > 0
          ? `Allowed next statuses from '${data.currentStatus}': ${allowed.join(", ")}`
          : `'${data.currentStatus}' is a terminal status and cannot be changed.`;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid status transition from '${data.currentStatus}' to '${data.nextStatus}'. ${detail}`,
        path: ["nextStatus"],
      });
    }
  });

export type BookingStatusTransitionInput = z.infer<
  typeof BookingStatusTransitionSchema
>;
