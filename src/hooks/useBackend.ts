// ─── Detail Pals V2 — Data Hooks ────────────────────────────────────
// Ready-to-use React hooks for every backend entity.
// Import these in your frontend components — they handle loading/error state.

import { useState, useEffect, useCallback } from 'react';
import type { Service, Booking, GalleryPair, Testimonial, DashboardStats, CustomerWithStats, BookingStatus } from '../lib/types';
import { getActiveServices, getMainServices, getAddonServices, getAllServices, updateService, toggleServiceActive } from '../services/servicesService';
import { getBookings, updateBookingStatus, type BookingFilters } from '../services/bookingService';
import { getGalleryPairs, getGalleryImages, getPublicGallery } from '../services/galleryService';
import { getVisibleTestimonials, getAllTestimonials } from '../services/adminService';
import { getDashboardStats, getCustomersWithStats, getContacts, getEmailLogs, type ContactMessage, type EmailLogEntry } from '../services/adminService';
import type { GalleryImage } from '../lib/types';

// ── useServices — public active services ────────────────────────────

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    getActiveServices().then(({ services, error }) => {
      setServices(services);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { services, loading, error };
}

export function useMainServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    getMainServices().then(({ services, error }) => {
      setServices(services);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { services, loading, error };
}

export function useAddonServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    getAddonServices().then(({ services, error }) => {
      setServices(services);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { services, loading, error };
}

// ── useGallery — public before/after pairs ───────────────────────────

export function useGalleryPairs() {
  const [pairs,   setPairs]   = useState<GalleryPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    getGalleryPairs().then(({ pairs, error }) => {
      setPairs(pairs);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { pairs, loading, error };
}

export function usePublicGallery() {
  const [pairs,   setPairs]   = useState<GalleryPair[]>([]);
  const [singles, setSingles] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    getPublicGallery().then(({ pairs, singles, error }) => {
      setPairs(pairs);
      setSingles(singles);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { pairs, singles, loading, error };
}

// ── useTestimonials — public visible testimonials ─────────────────────

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    getVisibleTestimonials().then(({ testimonials, error }) => {
      setTestimonials(testimonials);
      setError(error);
      setLoading(false);
    });
  }, []);

  return { testimonials, loading, error };
}

// ── useAdminDashboard ─────────────────────────────────────────────────

export function useAdminDashboard() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getDashboardStats().then(({ stats, error }) => {
      setStats(stats);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, loading, error, refresh };
}

// ── useAdminBookings ──────────────────────────────────────────────────

export function useAdminBookings(filters: BookingFilters = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [count,    setCount]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getBookings(filters).then(({ bookings, count, error }) => {
      setBookings(bookings);
      setCount(count);
      setError(error);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { refresh(); }, [refresh]);

  const changeStatus = useCallback(async (id: string, status: BookingStatus) => {
    const { error } = await updateBookingStatus(id, status);
    if (!error) refresh();
    return { error };
  }, [refresh]);

  return { bookings, count, loading, error, refresh, changeStatus };
}

// ── useAdminServices (all, including inactive) ────────────────────────

export function useAdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getAllServices().then(({ services, error }) => {
      setServices(services);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async (
    id:      string,
    updates: Partial<Omit<Service, 'id' | 'created_at'>>
  ) => {
    const { error } = await updateService(id, updates);
    if (!error) refresh();
    return { error };
  }, [refresh]);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    const { error } = await toggleServiceActive(id, active);
    if (!error) refresh();
    return { error };
  }, [refresh]);

  return { services, loading, error, refresh, update, toggleActive };
}

// ── useAdminTestimonials ──────────────────────────────────────────────

export function useAdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getAllTestimonials().then(({ testimonials, error }) => {
      setTestimonials(testimonials);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { testimonials, loading, error, refresh };
}

// ── useAdminCustomers ─────────────────────────────────────────────────

export function useAdminCustomers() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getCustomersWithStats().then(({ customers, error }) => {
      setCustomers(customers);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { customers, loading, error, refresh };
}

// ── useAdminGallery ───────────────────────────────────────────────────

export function useAdminGallery() {
  const [images,  setImages]  = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getGalleryImages().then(({ images, error }) => {
      setImages(images);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { images, loading, error, refresh };
}

// ── useAdminContacts ──────────────────────────────────────────────────

export function useAdminContacts() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getContacts().then(({ contacts, error }) => {
      setContacts(contacts);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { contacts, loading, error, refresh };
}

// ── useAdminEmailLogs ─────────────────────────────────────────────────

export function useAdminEmailLogs() {
  const [logs,    setLogs]    = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getEmailLogs().then(({ logs, error }) => {
      setLogs(logs);
      setError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { logs, loading, error, refresh };
}
