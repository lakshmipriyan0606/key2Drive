import { z } from "zod";
import {
  phoneSchema,
  futurePickupDateTimeSchema,
  submissionHashSchema,
  paginationQuerySchema,
} from "./common";
import { BookingStatusEnum } from "./status";

/**
 * Structured vehicle information schema.
 */
export const VehicleInfoObjectSchema = z.object({
  make: z.string().trim().min(1, "Vehicle make is required"),
  model: z.string().trim().min(1, "Vehicle model is required"),
  transmission: z
    .enum(["MANUAL", "AUTOMATIC"], {
      errorMap: () => ({ message: "Transmission must be MANUAL or AUTOMATIC" }),
    })
    .or(
      z
        .string()
        .transform((val) =>
          val.toUpperCase().includes("MANUAL") ? "MANUAL" : "AUTOMATIC"
        )
    ),
  category: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  licensePlate: z
    .string()
    .trim()
    .max(20, "License plate cannot exceed 20 characters")
    .optional()
    .nullable(),
});

export type VehicleInfoObject = z.infer<typeof VehicleInfoObjectSchema>;

/**
 * Flexible vehicle info schema: accepts either a descriptive string
 * or a structured VehicleInfoObject and serializes cleanly to string for DB storage.
 */
export const vehicleInfoSchema = z.union([
  z
    .string({ required_error: "Vehicle info is required" })
    .trim()
    .min(1, "Vehicle info must be at least 1 character")
    .max(200, "Vehicle info cannot exceed 200 characters"),
  VehicleInfoObjectSchema.transform(
    (v) =>
      `${v.make} ${v.model} (${v.transmission}${v.category ? `, ${v.category}` : ""})`
  ),
]);

/**
 * Duration schema: accepts number (hours) or human string (e.g. "4 hours", "8 hours", "Full Day").
 */
export const durationSchema = z
  .union([
    z.string().trim().min(1, "Duration is required"),
    z.number().positive("Duration must be greater than zero"),
  ])
  .transform((val) =>
    typeof val === "number" ? `${val} hour${val > 1 ? "s" : ""}` : val
  );

/**
 * Booking Creation Validation Schema
 * Validates customer name, 10-digit mobile number, valid email, pickup/drop locations,
 * future pickup date/time, duration, vehicle info, special instructions, and idempotency submissionHash.
 */
export const BaseBookingCreateSchema = z.object({
  customerName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name cannot exceed 100 characters"),
  customerPhone: phoneSchema,
  customerEmail: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),
  serviceId: z
    .string({ required_error: "Please select a service" })
    .trim()
    .min(1, "Service selection is required"),
  tariffId: z.string().trim().optional().nullable(),
  pickupAddress: z
    .string({ required_error: "Pickup address is required" })
    .trim()
    .min(5, "Pickup address must be at least 5 characters")
    .max(300, "Pickup address cannot exceed 300 characters"),
  dropAddress: z
    .string()
    .trim()
    .max(300, "Drop address cannot exceed 300 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  pickupDateTime: futurePickupDateTimeSchema,
  duration: durationSchema.optional().nullable(),
  vehicleInfo: vehicleInfoSchema,
  specialInstructions: z
    .string()
    .trim()
    .max(1000, "Special instructions cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  estimatedAmount: z
    .number({
      required_error: "Estimated fare amount is required",
      invalid_type_error: "Estimated amount must be a number",
    })
    .positive("Estimated amount must be greater than zero"),
  submissionHash: submissionHashSchema,
});

export const BookingCreateSchema = z.preprocess((raw: unknown) => {
  if (raw && typeof raw === "object") {
    const data = { ...(raw as Record<string, unknown>) };
    if (!data.vehicleInfo && (data.vehicleMake || data.vehicleModel)) {
      data.vehicleInfo = {
        make: String(data.vehicleMake || "").trim() || "Standard",
        model: String(data.vehicleModel || "").trim() || "Vehicle",
        transmission: String(data.transmission || "AUTOMATIC").toUpperCase().includes("MANUAL") ? "MANUAL" : "AUTOMATIC",
        category: data.vehicleCategory ? String(data.vehicleCategory).trim() : undefined,
      };
    }
    if (!data.duration && data.durationHours) {
      data.duration = `${data.durationHours} hours`;
    }
    return data;
  }
  return raw;
}, BaseBookingCreateSchema);

export type BookingCreateInput = z.infer<typeof BaseBookingCreateSchema>;

/**
 * Booking Status Update Schema (Admin)
 */
export const BookingStatusUpdateSchema = z.object({
  status: BookingStatusEnum,
  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional()
    .nullable(),
  changedBy: z
    .string()
    .trim()
    .min(1, "Actor identifier is required")
    .default("ADMIN"),
  finalAmount: z
    .number()
    .positive("Final amount must be greater than zero")
    .optional()
    .nullable(),
});

export type BookingStatusUpdateInput = z.infer<
  typeof BookingStatusUpdateSchema
>;

/**
 * Booking Admin Query Schema (Search & Filter)
 */
export const BookingQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(["ALL", "REQUESTED", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"])
    .optional()
    .default("ALL"),
  serviceId: z.string().optional(),
  search: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "pickupDateTime", "estimatedAmount", "reference"])
    .default("createdAt"),
});

export type BookingQueryInput = z.infer<typeof BookingQuerySchema>;
