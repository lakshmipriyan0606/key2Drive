import { z } from "zod";

/**
 * Admin Internal Note Schema
 * Used when staff or admins append internal notes to Bookings or Enquiries.
 */
export const AdminNoteCreateSchema = z
  .object({
    content: z
      .string({ required_error: "Note content cannot be empty" })
      .trim()
      .min(1, "Note content cannot be empty")
      .max(2000, "Note content cannot exceed 2000 characters"),
    bookingId: z.string().trim().optional().nullable(),
    enquiryId: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => Boolean(data.bookingId || data.enquiryId),
    {
      message: "Admin note must be attached to either a bookingId or an enquiryId.",
      path: ["bookingId"],
    }
  );

export type AdminNoteCreateInput = z.infer<typeof AdminNoteCreateSchema>;
