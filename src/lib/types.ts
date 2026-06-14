// ─── Detail Pals V2 — Database Types ────────────────────────────────
// These mirror the Supabase schema exactly.
// Import from here everywhere — never inline raw types.

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'luxury';
export type VehicleCondition = 'light' | 'moderate' | 'heavy';
export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
export type ServiceCategory = 'main' | 'addon';
export type GalleryTag = 'before' | 'after';

// ── Vehicle multipliers (matches old project pricing engine) ─────────
export const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  sedan:  1.0,
  suv:    1.2,
  truck:  1.25,
  van:    1.3,
  luxury: 1.4,
};

export const CONDITION_MULTIPLIERS: Record<VehicleCondition, number> = {
  light:    1.0,
  moderate: 1.15,
  heavy:    1.35,
};

// ── Table row types ──────────────────────────────────────────────────

export interface Customer {
  id:         string;
  name:       string;
  email:      string;
  phone:      string;
  created_at: string;
}

export interface Service {
  id:          string;
  name:        string;
  description: string;
  base_price:  number;
  category:    ServiceCategory;
  icon:        string;
  duration:    string;
  popular:     boolean;
  active:      boolean;
  sort_order:  number;
  created_at:  string;
}

export interface BookingServiceItem {
  id:    string;
  name:  string;
  price: number;
}

export interface Booking {
  id:                string;
  reference:         string;
  customer_id:       string | null;
  customer_name:     string;
  customer_email:    string;
  customer_phone:    string;
  vehicle_type:      VehicleType;
  vehicle_make:      string;
  vehicle_model:     string;
  vehicle_year:      string;
  vehicle_color:     string;
  vehicle_condition: VehicleCondition;
  condition_notes:   string;
  services:          BookingServiceItem[];
  addons:            BookingServiceItem[];
  total_price:       number;
  preferred_date:    string;
  preferred_time:    string;
  status:            BookingStatus;
  created_at:        string;
  updated_at:        string;
}

export interface GalleryImage {
  id:           string;
  url:          string;
  storage_path: string;
  tag:          GalleryTag;
  pair_id:      string | null;
  service_type: string;
  caption:      string;
  uploaded_at:  string;
}

export interface Testimonial {
  id:         string;
  author:     string;
  rating:     number;
  text:       string;
  vehicle:    string;
  visible:    boolean;
  created_at: string;
}

export interface Contact {
  id:         string;
  name:       string;
  email:      string;
  message:    string;
  created_at: string;
}

// ── Booking creation payload (what the booking wizard submits) ───────

export interface CreateBookingPayload {
  customer_name:     string;
  customer_email:    string;
  customer_phone:    string;
  vehicle_type:      VehicleType;
  vehicle_make:      string;
  vehicle_model:     string;
  vehicle_year:      string;
  vehicle_color:     string;
  vehicle_condition: VehicleCondition;
  condition_notes:   string;
  services:          BookingServiceItem[];
  addons:            BookingServiceItem[];
  total_price:       number;
  preferred_date:    string;
  preferred_time:    string;
}

// ── Admin dashboard stats ────────────────────────────────────────────

export interface DashboardStats {
  total_bookings:    number;
  pending_bookings:  number;
  completed_bookings: number;
  revenue_estimate:  number;
  recent_bookings:   Booking[];
  all_bookings?:     Booking[];
}

// ── Gallery pair (before + after) ───────────────────────────────────

export interface GalleryPair {
  pair_id:  string;
  before:   GalleryImage | null;
  after:    GalleryImage | null;
  caption:  string;
  service:  string;
}

// ── Customer with booking history (for admin customers view) ─────────

export interface CustomerWithStats extends Customer {
  total_bookings: number;
  total_spend:    number;
  last_booking:   string | null;
}
