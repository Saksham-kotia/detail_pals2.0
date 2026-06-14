// ─── Detail Pals V2 — Services Service ──────────────────────────────
// Read/write operations for the services + add_ons tables.
// Public reads use anon key (active services only via RLS).
// Admin writes require authenticated session.

import { supabase } from '../lib/supabase';
import type { Service, ServiceCategory } from '../lib/types';

function mapDbServiceToService(s: any): Service {
  let duration = '2-3 hours';
  if (s.duration_min !== undefined && s.duration_max !== undefined) {
    const min = Number(s.duration_min);
    const max = Number(s.duration_max);
    if (min === max) {
      if (min === 1) duration = '1 hour';
      else if (min >= 24) duration = min === 24 ? '1 day' : `${min / 24} days`;
      else duration = `${min} hours`;
    } else {
      if (min >= 24) {
        duration = `${min / 24}–${max / 24} days`;
      } else if (min === 12 && max === 24) {
        duration = '1 day';
      } else {
        duration = `${min}–${max} hours`;
      }
    }
  }
  return {
    id:          s.id,
    name:        s.name,
    description: s.description,
    base_price:  Number(s.base_price),
    category:    'main' as ServiceCategory,
    icon:        '',
    duration,
    popular:     s.badge === 'Most popular',
    active:      s.is_active,
    sort_order:  s.display_order ?? 0,
    created_at:  s.created_at,
  };
}

function mapDbAddonToService(a: any): Service {
  return {
    id:          a.id,
    name:        a.name,
    description: a.description,
    base_price:  Number(a.price),
    category:    'addon' as ServiceCategory,
    icon:        '',
    duration:    '',
    popular:     false,
    active:      a.is_active,
    sort_order:  0,
    created_at:  a.created_at,
  };
}

// ── Public: fetch active services ────────────────────────────────────

export async function getActiveServices(): Promise<{
  services: Service[];
  error:    string | null;
}> {
  try {
    const { data: services, error: sErr } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (sErr) return { services: [], error: sErr.message };

    const { data: addons, error: aErr } = await supabase
      .from('add_ons')
      .select('*')
      .eq('is_active', true);

    if (aErr) return { services: [], error: aErr.message };

    const mappedServices = (services || []).map(mapDbServiceToService);
    const mappedAddons = (addons || []).map(mapDbAddonToService);

    return {
      services: [...mappedServices, ...mappedAddons],
      error: null,
    };
  } catch (err) {
    return { services: [], error: String(err) };
  }
}

export async function getMainServices(): Promise<{
  services: Service[];
  error:    string | null;
}> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return {
    services: (data || []).map(mapDbServiceToService),
    error: error?.message ?? null,
  };
}

export async function getAddonServices(): Promise<{
  services: Service[];
  error:    string | null;
}> {
  const { data, error } = await supabase
    .from('add_ons')
    .select('*')
    .eq('is_active', true);

  return {
    services: (data || []).map(mapDbAddonToService),
    error: error?.message ?? null,
  };
}

// ── Admin: fetch ALL services (including inactive) ───────────────────

export async function getAllServices(): Promise<{
  services: Service[];
  error:    string | null;
}> {
  try {
    const { data: services, error: sErr } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (sErr) return { services: [], error: sErr.message };

    const { data: addons, error: aErr } = await supabase
      .from('add_ons')
      .select('*');

    if (aErr) return { services: [], error: aErr.message };

    const mappedServices = (services || []).map(mapDbServiceToService);
    const mappedAddons = (addons || []).map(mapDbAddonToService);

    return {
      services: [...mappedServices, ...mappedAddons],
      error: null,
    };
  } catch (err) {
    return { services: [], error: String(err) };
  }
}

// ── Admin: update a service ──────────────────────────────────────────

export async function updateService(
  id: string,
  updates: Partial<Omit<Service, 'id' | 'created_at'>>
): Promise<{ error: string | null }> {
  try {
    const dbServiceUpdates: any = {};
    if (updates.name !== undefined) dbServiceUpdates.name = updates.name;
    if (updates.description !== undefined) dbServiceUpdates.description = updates.description;
    if (updates.base_price !== undefined) dbServiceUpdates.base_price = updates.base_price;
    if (updates.active !== undefined) dbServiceUpdates.is_active = updates.active;
    if (updates.popular !== undefined) dbServiceUpdates.badge = updates.popular ? 'Most popular' : null;

    const { data: sData, error: sError } = await supabase
      .from('services')
      .update(dbServiceUpdates)
      .eq('id', id)
      .select();

    if (!sError && sData && sData.length > 0) {
      return { error: null };
    }

    const dbAddonUpdates: any = {};
    if (updates.name !== undefined) dbAddonUpdates.name = updates.name;
    if (updates.description !== undefined) dbAddonUpdates.description = updates.description;
    if (updates.base_price !== undefined) dbAddonUpdates.price = updates.base_price;
    if (updates.active !== undefined) dbAddonUpdates.is_active = updates.active;

    const { error: aError } = await supabase
      .from('add_ons')
      .update(dbAddonUpdates)
      .eq('id', id);

    return { error: aError?.message ?? null };
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Admin: toggle service active status ──────────────────────────────

export async function toggleServiceActive(
  id: string,
  active: boolean
): Promise<{ error: string | null }> {
  return updateService(id, { active });
}

// ── Admin: add a service ─────────────────────────────────────────────

export async function addService(service: {
  name: string;
  description: string;
  base_price: number;
  category: 'main' | 'addon';
  duration?: string;
}): Promise<{ error: string | null }> {
  try {
    if (service.category === 'main') {
      const { data: existing } = await supabase.from('services').select('tier');
      const existingTiers = existing?.map(s => s.tier) || [];
      const tier = service.name.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');

      // Parse duration if provided (e.g., "1 hour" or "3 hours" or "1-2 days")
      let duration_min = 2.0;
      let duration_max = 4.0;
      if (service.duration) {
        const dStr = service.duration.toLowerCase();
        if (dStr.includes('day')) {
          const numbers = dStr.match(/\d+/g);
          if (numbers && numbers.length === 2) {
            duration_min = parseInt(numbers[0]) * 24;
            duration_max = parseInt(numbers[1]) * 24;
          } else if (numbers && numbers.length === 1) {
            duration_min = parseInt(numbers[0]) * 24;
            duration_max = parseInt(numbers[0]) * 24;
          }
        } else if (dStr.includes('hour') || dStr.includes('hr')) {
          const numbers = dStr.match(/\d+/g);
          if (numbers && numbers.length === 2) {
            duration_min = parseInt(numbers[0]);
            duration_max = parseInt(numbers[1]);
          } else if (numbers && numbers.length === 1) {
            duration_min = parseInt(numbers[0]);
            duration_max = parseInt(numbers[0]);
          }
        }
      }

      const { error } = await supabase
        .from('services')
        .insert({
          tier,
          name: service.name,
          tagline: service.name,
          description: service.description,
          base_price: service.base_price,
          duration_min,
          duration_max,
          includes: [],
          is_active: true,
          display_order: existingTiers.length + 1
        });
      return { error: error?.message ?? null };
    } else {
      const { error } = await supabase
        .from('add_ons')
        .insert({
          name: service.name,
          description: service.description,
          price: service.base_price,
          is_active: true
        });
      return { error: error?.message ?? null };
    }
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Admin: delete a service ──────────────────────────────────────────

export async function deleteService(id: string): Promise<{ error: string | null }> {
  try {
    const { error: sError, data: sData } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .select();

    if (!sError && sData && sData.length > 0) {
      return { error: null };
    }

    const { error: aError } = await supabase
      .from('add_ons')
      .delete()
      .eq('id', id);

    return { error: aError?.message ?? null };
  } catch (err) {
    return { error: String(err) };
  }
}
