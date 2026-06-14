// ─── Detail Pals V2 — Validation Schemas ────────────────────────────
// Zod schemas for all form inputs — validated on both client and server.
// Install: npm install zod

import { z } from 'zod';

// ── Booking wizard validation ────────────────────────────────────────

export const bookingServiceItemSchema = z.object({
  id:    z.string().uuid(),
  name:  z.string().min(1),
  price: z.number().nonnegative(),
});

export const createBookingSchema = z.object({
  customer_name:     z.string().min(2, 'Name must be at least 2 characters'),
  customer_email:    z.string().email('Please enter a valid email address'),
  customer_phone:    z.string().min(7, 'Please enter a valid phone number'),
  vehicle_type:      z.enum(['sedan', 'suv', 'truck', 'van', 'luxury']),
  vehicle_make:      z.string().min(1, 'Vehicle make is required'),
  vehicle_model:     z.string().min(1, 'Vehicle model is required'),
  vehicle_year:      z.string().regex(/^\d{4}$/, 'Please enter a valid year'),
  vehicle_color:     z.string().optional().default(''),
  vehicle_condition: z.enum(['light', 'moderate', 'heavy']),
  condition_notes:   z.string().optional().default(''),
  services:          z.array(bookingServiceItemSchema).min(1, 'Select at least one service'),
  addons:            z.array(bookingServiceItemSchema).default([]),
  total_price:       z.number().positive('Total price must be greater than 0'),
  preferred_date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a date'),
  preferred_time:    z.string().min(1, 'Please select a time'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

// ── Contact form validation ──────────────────────────────────────────

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ── Admin: booking status update ─────────────────────────────────────

export const updateBookingStatusSchema = z.object({
  booking_id: z.string().uuid(),
  status:     z.enum(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled']),
});

// ── Admin: service update ────────────────────────────────────────────

export const updateServiceSchema = z.object({
  id:          z.string().uuid(),
  name:        z.string().min(1).optional(),
  description: z.string().optional(),
  base_price:  z.number().nonnegative().optional(),
  active:      z.boolean().optional(),
  popular:     z.boolean().optional(),
});

// ── Admin: testimonial ───────────────────────────────────────────────

export const upsertTestimonialSchema = z.object({
  id:      z.string().uuid().optional(),
  author:  z.string().min(1),
  rating:  z.number().int().min(1).max(5),
  text:    z.string().min(10),
  vehicle: z.string().optional().default(''),
  visible: z.boolean().default(true),
});
