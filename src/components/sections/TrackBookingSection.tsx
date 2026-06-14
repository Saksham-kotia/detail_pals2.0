import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Section, SectionInner, PrimaryButton, ArrowRight } from '@/design-system'
import { supabase } from '@/lib/supabase'
import type { Booking, BookingStatus } from '@/lib/types'

export function TrackBookingSection() {
  const [refInput, setRefInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Live update listener for the currently tracked booking
  useEffect(() => {
    if (!booking) return;

    const channel = supabase
      .channel(`track-booking-${booking.reference}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`,
        },
        async (payload) => {
          console.log('[TrackBookingSection] Live update received:', payload);
          if (payload.new && (payload.new as any).status) {
            // Re-fetch full booking relations to ensure correct services, customer mapping etc.
            const { data, error } = await supabase
              .from('bookings')
              .select('*, customer:customers(*), service:services(*)')
              .eq('id', booking.id)
              .single();

            if (!error && data) {
              const { data: dbAddons } = await supabase.from('add_ons').select('*');
              // Helper to map DB booking structure to frontend Booking model
              const addonsList: any[] = [];
              if (data.add_on_ids && dbAddons) {
                for (const addOnId of data.add_on_ids) {
                  const matched = dbAddons.find(a => a.id === addOnId);
                  if (matched) {
                    addonsList.push({
                      id: matched.id,
                      name: matched.name,
                      price: Number(matched.price)
                    });
                  }
                }
              }

              let timeDisplay = data.time_slot;
              if (data.time_slot && data.time_slot.includes(':')) {
                const parts = data.time_slot.split(':');
                let h = parseInt(parts[0], 10);
                const mStr = parts[1];
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12;
                if (h === 0) h = 12;
                timeDisplay = `${h}:${mStr} ${ampm}`;
              }

              setBooking({
                id: data.id,
                reference: data.ref,
                customer_id: data.customer_id,
                customer_name: data.customer_name ?? data.customer?.name ?? 'Unknown',
                customer_email: data.customer_email ?? data.customer?.email ?? '',
                customer_phone: data.customer_phone ?? data.customer?.phone ?? '',
                vehicle_type: data.vehicle_type,
                vehicle_make: data.vehicle_make,
                vehicle_model: data.vehicle_model,
                vehicle_year: String(data.vehicle_year ?? ''),
                vehicle_color: data.vehicle_color || '',
                vehicle_condition: data.condition,
                condition_notes: data.notes ?? '',
                services: data.service ? [{
                  id: data.service.id,
                  name: data.service.name,
                  price: Number(data.service.base_price)
                }] : [],
                addons: addonsList,
                total_price: Number(data.quoted_price),
                preferred_date: data.booking_date,
                preferred_time: timeDisplay,
                status: data.status,
                created_at: data.created_at,
                updated_at: data.updated_at
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setBooking(null);

    try {
      const cleanRef = refInput.trim().toUpperCase();
      const { data, error } = await supabase
        .from('bookings')
        .select('*, customer:customers(*), service:services(*)')
        .eq('ref', cleanRef)
        .maybeSingle();

      if (error) {
        setSearchError(error.message);
      } else if (!data) {
        setSearchError('No booking found with this reference code.');
      } else {
        const { data: dbAddons } = await supabase.from('add_ons').select('*');
        const addonsList: any[] = [];
        if (data.add_on_ids && dbAddons) {
          for (const addOnId of data.add_on_ids) {
            const matched = dbAddons.find(a => a.id === addOnId);
            if (matched) {
              addonsList.push({
                id: matched.id,
                name: matched.name,
                price: Number(matched.price)
              });
            }
          }
        }

        let timeDisplay = data.time_slot;
        if (data.time_slot && data.time_slot.includes(':')) {
          const parts = data.time_slot.split(':');
          let h = parseInt(parts[0], 10);
          const mStr = parts[1];
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          if (h === 0) h = 12;
          timeDisplay = `${h}:${mStr} ${ampm}`;
        }

        setBooking({
          id: data.id,
          reference: data.ref,
          customer_id: data.customer_id,
          customer_name: data.customer_name ?? data.customer?.name ?? 'Unknown',
          customer_email: data.customer_email ?? data.customer?.email ?? '',
          customer_phone: data.customer_phone ?? data.customer?.phone ?? '',
          vehicle_type: data.vehicle_type,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: String(data.vehicle_year ?? ''),
          vehicle_color: data.vehicle_color || '',
          vehicle_condition: data.condition,
          condition_notes: data.notes ?? '',
          services: data.service ? [{
            id: data.service.id,
            name: data.service.name,
            price: Number(data.service.base_price)
          }] : [],
          addons: addonsList,
          total_price: Number(data.quoted_price),
          preferred_date: data.booking_date,
          preferred_time: timeDisplay,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (err) {
      setSearchError('An unexpected error occurred while searching.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIndex = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'in-progress': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  const statusIndex = booking ? getStatusIndex(booking.status) : 0;
  const isCancelled = booking?.status === 'cancelled';

  const steps = [
    { label: 'Awaited', desc: 'Awaiting admin confirmation' },
    { label: 'Confirmed', desc: 'Booking slot locked in' },
    { label: 'In Progress', desc: 'Vehicle being detailed' },
    { label: 'Completed', desc: 'Ready for collection' },
  ];

  return (
    <Section id="track-booking" className="relative bg-dp-bg-dark border-t border-dp-border py-24">
      {/* Glow ambient background lights */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[40%] rounded-full bg-[#C9A84C]/[0.015] filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-[#00D2FF]/[0.01] filter blur-[120px] pointer-events-none" />

      <SectionInner>
        <div className="max-w-[800px] mx-auto text-center">
          <p className="font-sans font-normal text-[10px] tracking-[0.25em] uppercase text-dp-gold mb-3">
            Realtime Tracking
          </p>
          <h2 className="font-display font-light text-4xl text-dp-text mb-4">
            Track Your Booking
          </h2>
          <p className="font-sans font-light text-sm text-dp-text-muted mb-8 max-w-[500px] mx-auto leading-relaxed">
            Enter your 8-character reference ID to check the status of your reservation and monitor updates in real time.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-[550px] mx-auto mb-10">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="DP-XXXXXX"
              className="flex-1 border border-[var(--dp-border)] bg-[var(--dp-surface)] text-dp-text font-sans font-light text-sm px-5 py-4 focus:outline-none focus:border-[var(--dp-gold)] transition-colors placeholder:text-dp-text-subtle rounded-none tracking-widest text-center sm:text-left uppercase"
            />
            <PrimaryButton
              as="button"
              disabled={isSearching}
              className="px-8 py-4 justify-center whitespace-nowrap"
            >
              {isSearching ? 'Tracking...' : 'Track Status'} <ArrowRight />
            </PrimaryButton>
          </form>

          {/* Alert messages */}
          <AnimatePresence mode="wait">
            {searchError && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-red-500/30 bg-red-950/20 text-red-400 font-sans font-light text-sm py-3 px-5 mb-8 max-w-[550px] mx-auto text-center"
              >
                {searchError}
              </m.div>
            )}
          </AnimatePresence>

          {/* Booking Tracking Info */}
          <AnimatePresence>
            {booking && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border border-[var(--dp-border)] bg-dp-surface/20 backdrop-blur-md p-8 text-left space-y-8"
              >
                {/* Header status bar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-dp-border pb-5 gap-4">
                  <div>
                    <span className="font-sans text-[10px] tracking-widest uppercase text-dp-gold mb-1 block">
                      Booking Reference
                    </span>
                    <h3 className="font-sans font-light text-2xl text-dp-text tracking-wider uppercase">
                      {booking.reference}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dp-gold opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dp-gold"></span>
                    </span>
                    <span className="font-sans text-[10px] tracking-widest uppercase text-dp-text-muted">
                      Live status syncing active
                    </span>
                  </div>
                </div>

                {/* Status Stepper / Progress */}
                {isCancelled ? (
                  <div className="border border-red-500/40 bg-red-950/20 px-6 py-5 text-center">
                    <p className="font-display font-light text-lg text-red-400 mb-1">Booking Cancelled</p>
                    <p className="font-sans font-light text-xs text-red-300/80">
                      This booking request has been cancelled. Please get in touch for details or rescheduling.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative pt-4">
                    {steps.map((stepInfo, idx) => {
                      const isPast = idx < statusIndex;
                      const isCurrent = idx === statusIndex;
                      const isFuture = idx > statusIndex;

                      return (
                        <div key={stepInfo.label} className="relative flex flex-col items-center sm:items-start text-center sm:text-left">
                          {/* Dot / line */}
                          <div className="flex items-center w-full mb-3 justify-center sm:justify-start">
                            <div
                              className={`w-6 h-6 border flex items-center justify-center transition-all duration-300 ${
                                isPast
                                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400'
                                  : isCurrent
                                  ? 'border-dp-gold bg-dp-gold/10 text-dp-gold shadow-gold-sm font-semibold'
                                  : 'border-dp-border text-dp-text-muted'
                              }`}
                            >
                              {isPast ? (
                                <span className="text-xs">✓</span>
                              ) : (
                                <span className="font-sans text-[10px]">{idx + 1}</span>
                              )}
                            </div>
                            {idx < 3 && (
                              <div
                                className="hidden sm:block h-px flex-1 ml-3 bg-dp-border"
                                style={{
                                  background: isPast
                                    ? '#10b981'
                                    : isCurrent
                                    ? 'linear-gradient(90deg, var(--dp-gold) 0%, var(--dp-border) 100%)'
                                    : 'var(--dp-border)'
                                }}
                              />
                            )}
                          </div>
                          {/* Stepper info */}
                          <p
                            className={`font-sans text-xs tracking-wider uppercase mb-1 ${
                              isCurrent ? 'text-dp-gold font-normal' : isPast ? 'text-emerald-400' : 'text-dp-text-subtle'
                            }`}
                          >
                            {stepInfo.label}
                          </p>
                          <p className="font-sans font-light text-[10px] text-dp-text-muted leading-tight">
                            {stepInfo.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Detailed specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dp-border pt-6 text-xs font-sans">
                  <div className="space-y-4">
                    <div>
                      <span className="text-dp-text-muted block mb-1">Customer Name</span>
                      <p className="text-dp-text font-normal">{booking.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-dp-text-muted block mb-1">Registered Vehicle</span>
                      <p className="text-dp-text font-normal">
                        {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model} ({booking.vehicle_type})
                      </p>
                    </div>
                    <div>
                      <span className="text-dp-text-muted block mb-1">Preferred Date & Time</span>
                      <p className="text-dp-text font-normal">
                        {new Date(booking.preferred_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })} at {booking.preferred_time}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-dp-text-muted block mb-2">Services & Add-ons</span>
                      <div className="space-y-2 border border-dp-border/60 bg-dp-surface/40 p-4">
                        {booking.services.map((s: any) => (
                          <div key={s.id} className="flex justify-between">
                            <span className="text-dp-text font-light">{s.name}</span>
                            <span className="text-dp-text-muted">${s.price}</span>
                          </div>
                        ))}
                        {booking.addons.map((a: any) => (
                          <div key={a.id} className="flex justify-between">
                            <span className="text-dp-text-subtle">{a.name} (Add-on)</span>
                            <span className="text-dp-text-muted">+${a.price}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-dp-border/50 pt-2 font-normal">
                          <span className="text-dp-gold">Total Quoted</span>
                          <span className="text-dp-gold">${booking.total_price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </SectionInner>
    </Section>
  );
}
