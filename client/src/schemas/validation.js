/**
 * Zod Validation Schemas  (PO5 — Modern Tool Usage: Zod + React Hook Form)
 *
 * Provides compile-time type-safe validation for all forms.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password cannot exceed 50 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s-]{7,15}$/.test(val),
        'Please enter a valid phone number'
      ),
    vehicleNumber: z
      .string()
      .min(1, 'Vehicle number is required')
      .max(20, 'Vehicle number too long'),
    vehicleType: z.enum(['car', 'bike', 'ev', 'truck'], {
      errorMap: () => ({ message: 'Please select a vehicle type' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const bookingSchema = z.object({
  slotId: z.string().min(1, 'Please select a parking slot'),
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .max(20, 'Vehicle number too long'),
  vehicleType: z.enum(['car', 'bike', 'ev', 'truck']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  phone: z.string().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.enum(['car', 'bike', 'ev', 'truck']).optional(),
});

export const slotSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required'),
  floor: z.coerce.number().min(0, 'Floor must be 0 or above'),
  zone: z.enum(['A', 'B', 'C', 'D', 'E']),
  type: z.enum(['car', 'bike', 'ev', 'truck', 'handicapped']),
  pricePerHour: z.coerce.number().min(0, 'Price cannot be negative'),
  features: z.array(z.string()).optional(),
});
