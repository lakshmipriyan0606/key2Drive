import { z } from "zod";

/**
 * Admin Authentication Schema
 * Validates email format and password length for administrator login.
 */
export const AdminLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

/**
 * Admin Password Change / Profile Schema
 */
export const AdminPasswordChangeSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .max(100, "New password cannot exceed 100 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export type AdminPasswordChangeInput = z.infer<
  typeof AdminPasswordChangeSchema
>;
