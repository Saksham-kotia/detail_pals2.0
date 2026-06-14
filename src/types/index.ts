/**
 * DETAIL PALS V2 — Shared Types
 * ================================
 * All domain types used across sections.
 * No business logic here — pure type definitions.
 */

// ─── Services ────────────────────────────────────────────────

export type ServiceTier =
  | 'basic_wash'
  | 'interior_deep'
  | 'exterior_polish'
  | 'full_detail'
  | 'ceramic_coating'
  | 'paint_correction'

export interface Service {
  id: ServiceTier
  name: string
  tagline: string
  description: string
  duration: string
  includes: string[]
  price: number
  badge?: string
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
}

// ─── Quote / Pricing ─────────────────────────────────────────

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'luxury'
export type VehicleCondition = 'light' | 'moderate' | 'heavy'

export interface VehicleMultipliers {
  sedan:  number
  suv:    number
  truck:  number
  van:    number
  luxury: number
}

export interface ConditionMultipliers {
  light:    number
  moderate: number
  heavy:    number
}

export interface QuoteState {
  tier:      ServiceTier | null
  vehicle:   VehicleType | null
  condition: VehicleCondition | null
  addOns:    string[]
  total:     number
}

// ─── Gallery ─────────────────────────────────────────────────

export type GalleryTag = 'all' | 'sedan' | 'suv' | 'luxury' | 'ceramic' | 'correction'

export interface GalleryItem {
  id: string
  beforeAlt: string
  afterAlt:  string
  service:   string
  vehicle:   string
  hours:     number
  tag:       GalleryTag[]
  /** 0–100: initial slider position (default 50) */
  sliderInit?: number
  beforeUrl?: string
  afterUrl?:  string
}

// ─── Testimonials ────────────────────────────────────────────

export interface Testimonial {
  id:      string
  quote:   string
  author:  string
  vehicle: string
  service: ServiceTier
  rating:  number
  date:    string
}

// ─── Stats ───────────────────────────────────────────────────

export interface Stat {
  value:  string
  suffix: string
  label:  string
  detail: string
}
