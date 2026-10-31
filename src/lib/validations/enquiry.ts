import { z } from "zod";
import { phoneSchema, paginationQuerySchema } from "./common";

/**
 * Enquiry Status Enum matching Prisma schema
 */
export const EnquiryStatusEnum = z.enum(["PENDING", "IN_REVIEW", "RESOLVED"]);
export type EnquiryStatus = z.infer<typeof EnquiryStatusEnum>;

/**
 * Enquiry Submission Schema (Customer Facing)
 * Validates customer name, 10-digit mobile number, valid email, subject, and message.
 */
export const EnquiryCreateSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  phone: phoneSchema,
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  subject: z
    .string({ required_error: "Subject is required" })
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters"),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

export type EnquiryCreateInput = z.infer<typeof EnquiryCreateSchema>;

/**
 * Enquiry Status & Resolution Update Schema (Admin Facing)
 */
export const EnquiryUpdateSchema = z.object({
  status: EnquiryStatusEnum.optional(),
  isResolved: z.boolean().optional(),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Internal notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export type EnquiryUpdateInput = z.infer<typeof EnquiryUpdateSchema>;

/**
 * Enquiry Admin Query Schema (Search & Filter)
 */
export const EnquiryQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["ALL", "PENDING", "IN_REVIEW", "RESOLVED"])
    .optional()
    .default("ALL"),
  isResolved: z.enum(["all", "true", "false"]).optional().default("all"),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "name", "status"]).default("createdAt"),
});

export type EnquiryQueryInput = z.infer<typeof EnquiryQuerySchema>;
