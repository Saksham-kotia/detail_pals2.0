// ─── Detail Pals V2 — Pricing Engine ────────────────────────────────
// Mirrors the old project's pricing logic exactly.
// Prices are ALWAYS recomputed here — never trust client-supplied totals.

import type { VehicleType, VehicleCondition, BookingServiceItem } from './types';
import { VEHICLE_MULTIPLIERS, CONDITION_MULTIPLIERS } from './types';

/**
 * Compute the final price for a single service item given vehicle/condition.
 * base_price × vehicle_multiplier × condition_multiplier
 */
export function computeServicePrice(
  basePrice: number,
  vehicleType: VehicleType,
  condition: VehicleCondition
): number {
  const vMult = VEHICLE_MULTIPLIERS[vehicleType] ?? 1.0;
  const cMult = CONDITION_MULTIPLIERS[condition] ?? 1.0;
  return Math.round(basePrice * vMult * cMult * 100) / 100;
}

/**
 * Recompute the total price for a booking from first principles.
 * Used server-side (in Vercel functions) to verify client totals.
 */
export function recomputeTotal(
  services: BookingServiceItem[],
  addons: BookingServiceItem[],
  vehicleType: VehicleType,
  condition: VehicleCondition,
  basePriceMap: Record<string, number> // serviceId → base_price from DB
): number {
  let total = 0;

  for (const s of services) {
    const base = basePriceMap[s.id];
    if (base !== undefined) {
      total += computeServicePrice(base, vehicleType, condition);
    }
  }

  for (const a of addons) {
    const base = basePriceMap[a.id];
    if (base !== undefined) {
      // Add-ons don't get condition multiplier — only vehicle multiplier
      const vMult = VEHICLE_MULTIPLIERS[vehicleType] ?? 1.0;
      total += Math.round(base * vMult * 100) / 100;
    }
  }

  return Math.round(total * 100) / 100;
}

/**
 * Generate a booking reference like DP-7K2M9X (matches old project format)
 */
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let ref = 'DP-';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

/**
 * Industry-average pricing fallback dataset (mirrors old project's fallback)
 * Used when the optional PRICING_BENCHMARK_URL is not configured.
 */
export const INDUSTRY_AVERAGE_FALLBACK = [
  { service: 'Basic Wash & Vacuum',   low: 80,  high: 150 },
  { service: 'Interior Deep Clean',   low: 120, high: 220 },
  { service: 'Exterior Polish & Wax', low: 150, high: 250 },
  { service: 'Full Detail Package',   low: 250, high: 400 },
  { service: 'Ceramic Coating',       low: 500, high: 1200 },
  { service: 'Paint Correction',      low: 350, high: 700 },
];
