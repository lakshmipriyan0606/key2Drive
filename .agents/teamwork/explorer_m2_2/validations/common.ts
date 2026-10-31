import { z } from "zod";

/**
 * Sanitizes an Indian phone number by removing spaces, hyphens, parentheses,
 * dots, and optional country code (+91 or 91) or leading zero.
 * Returns the raw 10-digit mobile number.
 */
export function sanitizeIndianPhone(val: string): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/[\s\-\(\)\.]/g, "")
    .replace(/^(?:\+91|91|0)/, "");
}

/**
 * Strict Indian 10-digit mobile number schema.
 * Rejects numbers not starting with 6, 7, 8, or 9, or not having exactly 10 digits.
 */
export const phoneSchema = z
  .string({
    required_error: "Mobile number is required",
    invalid_type_error: "Mobile number must be a string",
  })
  .trim()
  .min(1, "Mobile number is required")
  .transform(sanitizeIndianPhone)
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)",
  });

/**
 * Schema validating that a pickup date & time is a valid date and scheduled
 * at least 15 minutes into the future to allow dispatch preparation.
 */
export const futurePickupDateTimeSchema = z
  .union([
    z.string().min(1, "Pickup date and time is required"),
    z.date({ required_error: "Pickup date and time is required" }),
  ])
  .transform((val) => (typeof val === "string" ? new Date(val) : val))
  .refine((date) => !isNaN(date.getTime()), {
    message: "Please provide a valid pickup date and time.",
  })
  .refine(
    (date) => {
      // Must be at least 15 minutes in the future
      const minLeadTimeMs = 15 * 60 * 1000;
      return date.getTime() >= Date.now() + minLeadTimeMs;
    },
    {
      message: "Pickup date and time must be at least 15 minutes in the future.",
    }
  );

/**
 * Idempotency submission hash schema.
 * Generated client-side or during booking calculation to prevent duplicate submissions.
 */
export const submissionHashSchema = z
  .string({
    required_error: "Submission hash is required for idempotency protection",
  })
  .trim()
  .min(8, "Submission hash must be at least 8 characters")
  .max(128, "Submission hash cannot exceed 128 characters");

/**
 * Standard pagination and sorting query schema.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
