import { z } from "zod";

/**
 * Tariff Update Schema (Admin Pricing Management)
 * Allows admins to adjust base rate, extra hour/km rates, night charges,
 * waiting charges, unconfirmed status flag, and cancellation policy.
 */
export const TariffUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  vehicleCategory: z
    .string()
    .trim()
    .min(2, "Vehicle category must be at least 2 characters")
    .max(50, "Vehicle category cannot exceed 50 characters")
    .optional(),
  baseRate: z
    .number()
    .min(0, "Base rate cannot be negative")
    .optional(),
  includedHours: z
    .number()
    .int("Included hours must be an integer")
    .min(0, "Included hours cannot be negative")
    .optional()
    .nullable(),
  includedKm: z
    .number()
    .int("Included km must be an integer")
    .min(0, "Included km cannot be negative")
    .optional()
    .nullable(),
  extraHourRate: z
    .number()
    .min(0, "Extra hour rate cannot be negative")
    .optional(),
  extraKmRate: z
    .number()
    .min(0, "Extra km rate cannot be negative")
    .optional(),
  nightChargeRate: z
    .number()
    .min(0, "Night charge rate cannot be negative")
    .optional(),
  waitingChargePerMin: z
    .number()
    .min(0, "Waiting charge per minute cannot be negative")
    .optional(),
  cancellationPolicy: z
    .string()
    .trim()
    .max(1000, "Cancellation policy cannot exceed 1000 characters")
    .optional()
    .nullable(),
  isUnconfirmed: z.boolean().optional(),
});

export type TariffUpdateInput = z.infer<typeof TariffUpdateSchema>;

/**
 * Tariff Create Schema (Admin Creating New Tariff Tier)
 */
export const TariffCreateSchema = z.object({
  serviceId: z
    .string({ required_error: "Service ID is required" })
    .trim()
    .min(1, "Service ID is required"),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  vehicleCategory: z
    .string({ required_error: "Vehicle category is required" })
    .trim()
    .min(2, "Vehicle category is required")
    .max(50, "Vehicle category cannot exceed 50 characters"),
  baseRate: z
    .number({ required_error: "Base rate is required" })
    .min(0, "Base rate cannot be negative"),
  includedHours: z.number().int().min(0).optional().nullable(),
  includedKm: z.number().int().min(0).optional().nullable(),
  extraHourRate: z.number().min(0).default(0),
  extraKmRate: z.number().min(0).default(0),
  nightChargeRate: z.number().min(0).default(0),
  waitingChargePerMin: z.number().min(0).default(0),
  cancellationPolicy: z.string().trim().max(1000).optional().nullable(),
  isUnconfirmed: z.boolean().default(false),
});

export type TariffCreateInput = z.infer<typeof TariffCreateSchema>;

/**
 * Service Create Schema (Admin Creating New Service)
 */
export const ServiceCreateSchema = z.object({
  title: z
    .string({ required_error: "Title / Name is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  tagline: z
    .string({ required_error: "Tagline is required" })
    .trim()
    .min(3, "Tagline must be at least 3 characters")
    .max(200, "Tagline cannot exceed 200 characters"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  features: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().trim(),
    ])
    .transform((val) => (Array.isArray(val) ? JSON.stringify(val) : val))
    .default("[]"),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .default(0),
  priceUnit: z
    .string()
    .trim()
    .min(1, "Price unit cannot be empty")
    .max(50, "Price unit cannot exceed 50 characters")
    .default("per trip"),
  image: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;

/**
 * Service Update Schema (Admin Service Management)
 * Allows updating service details, marketing copy, pricing headline, and active toggle.
 */
export const ServiceUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  tagline: z
    .string()
    .trim()
    .min(3, "Tagline must be at least 3 characters")
    .max(200, "Tagline cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  features: z
    .union([
      z.array(z.string().trim().min(1)),
      z.string().trim(),
    ])
    .transform((val) => (Array.isArray(val) ? JSON.stringify(val) : val))
    .optional(),
  basePrice: z
    .number()
    .min(0, "Base price cannot be negative")
    .optional(),
  priceUnit: z
    .string()
    .trim()
    .min(1, "Price unit cannot be empty")
    .max(50, "Price unit cannot exceed 50 characters")
    .optional(),
  image: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;
