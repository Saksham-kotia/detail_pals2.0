/**
 * DETAIL PALS V2 — Validation Schemas
 * =====================================
 * File: src/lib/validation/schemas.ts
 *
 * All Zod schemas for client-side form validation.
 * These same schemas are mirrored in the Edge Functions for server-side validation.
 * Never trust client input — the Edge Function re-validates everything.
 */

import { z } from 'zod'

// ─── Common field validators ─────────────────────────────────

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/

const phone = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(phoneRegex, 'Please enter a valid phone number')

const email = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()

const vehicleYear = z
  .number()
  .int()
  .min(1990, 'Vehicle year must be 1990 or later')
  .max(new Date().getFullYear() + 1, 'Vehicle year cannot be in the future')
  .optional()

// ─── Booking form ────────────────────────────────────────────

export const bookingFormSchema = z.object({
  // Step 1: Service
  service_tier: z.enum(['essential', 'signature', 'concours'], {
    error: 'Please select a service',
  }),

  // Step 2: Date & time
  booking_date: z.string().min(1, 'Please select a date'),
  time_slot:    z.string().min(1, 'Please select a time'),

  // Step 3: Contact & vehicle
  name:          z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone,
  email:         email.optional().or(z.literal('')),
  vehicle_make:  z.string().min(1, 'Vehicle make is required').max(50),
  vehicle_model: z.string().min(1, 'Vehicle model is required').max(50),
  vehicle_year:  vehicleYear,
  vehicle_type:  z.enum(['sedan', 'suv', 'truck', 'van', 'luxury'], {
    error: 'Please select vehicle type',
  }),
  condition: z.enum(['light', 'moderate', 'heavy'], {
    error: 'Please select paint condition',
  }),

  // Add-ons
  add_on_ids: z.array(z.string()).default([]),

  // Notes
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// ─── Contact form ────────────────────────────────────────────

export const contactFormSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone:   phone.optional().or(z.literal('')),
  email:   email.optional().or(z.literal('')),
  vehicle: z.string().max(100).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
}).refine(data => data.phone || data.email, {
  message: 'Please provide either a phone number or email address',
  path: ['phone'],
})

export type ContactFormData = z.infer<typeof contactFormSchema>

// ─── Admin login ─────────────────────────────────────────────

export const loginSchema = z.object({
  email:    email,
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ─── Admin: create staff ─────────────────────────────────────

export const createStaffSchema = z.object({
  full_name: z.string().min(2).max(100),
  email,
  role: z.enum(['admin', 'staff']),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type CreateStaffData = z.infer<typeof createStaffSchema>

// ─── Admin: update booking status ────────────────────────────

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  note:   z.string().max(500).optional(),
})

export type UpdateBookingStatusData = z.infer<typeof updateBookingStatusSchema>

// ─── Admin: pricing config ───────────────────────────────────

export const pricingConfigSchema = z.object({
  vehicle_multipliers: z.object({
    sedan:  z.number().min(0.5).max(3.0),
    suv:    z.number().min(0.5).max(3.0),
    truck:  z.number().min(0.5).max(3.0),
    van:    z.number().min(0.5).max(3.0),
    luxury: z.number().min(0.5).max(3.0),
  }),
  condition_multipliers: z.object({
    light:    z.number().min(0.5).max(3.0),
    moderate: z.number().min(0.5).max(3.0),
    heavy:    z.number().min(0.5).max(3.0),
  }),
})

export type PricingConfigData = z.infer<typeof pricingConfigSchema>

// ─── Admin: block availability slot ──────────────────────────

export const blockSlotSchema = z.object({
  slot_date:       z.string().min(1, 'Date is required'),
  time_slot:       z.string().optional(), // null = block full day
  blocked_reason:  z.string().max(200).optional(),
})

export type BlockSlotData = z.infer<typeof blockSlotSchema>

// ─── Admin: add testimonial ──────────────────────────────────

export const testimonialSchema = z.object({
  author_name:  z.string().min(2).max(100),
  vehicle:      z.string().min(2).max(100),
  service_tier: z.enum(['essential', 'signature', 'concours']).optional(),
  rating:       z.number().int().min(1).max(5),
  quote:        z.string().min(20, 'Quote must be at least 20 characters').max(600),
  review_date:  z.string().min(1),
  platform:     z.enum(['google', 'direct', 'facebook', 'trustpilot']).default('direct'),
  booking_id:   z.string().uuid().optional(),
})

export type TestimonialFormData = z.infer<typeof testimonialSchema>

// ─── Admin: gallery item ─────────────────────────────────────

export const galleryItemSchema = z.object({
  vehicle:     z.string().min(2).max(100),
  service_id:  z.string().uuid().optional(),
  hours:       z.number().int().min(1).max(72),
  tags:        z.array(z.string()).default([]),
  caption:     z.string().max(300).optional(),
  is_published: z.boolean().default(false),
})

export type GalleryItemFormData = z.infer<typeof galleryItemSchema>
