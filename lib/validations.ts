import { z } from "zod";

export const bookingSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),

  email: z.string().email("Invalid email address"),

  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{6,14}$/,
      "Phone must be a valid international number (7–15 digits, optionally prefixed with +)"
    ),

  passport_number: z
    .string()
    .min(5, "Passport number too short")
    .max(20, "Passport number too long")
    .regex(
      /^[A-Z0-9]{5,20}$/,
      "Passport must be 5–20 uppercase alphanumeric characters"
    ),

  package_id: z.string().uuid("Invalid package ID"),

  travel_date: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid travel date")
    .refine(
      (d) => new Date(d) > new Date(),
      "Travel date must be in the future"
    ),

  num_travellers: z
    .number()
    .int()
    .min(1, "At least 1 traveller required")
    .max(50, "Maximum 50 travellers per booking"),

  special_requests: z.string().max(500, "Special requests too long").optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});