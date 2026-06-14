// ─── Detail Pals V2 — Admin Dashboard ───────────────────────────────

import React, { useState } from 'react';
import { useAdminDashboard } from '../../hooks/useBackend';
import { formatDate, formatCurrency } from '../components/adminUtils';
import type { Booking } from '../../lib/types';

export default function AdminDashboard() {
  const { stats, loading, error, refresh } = useAdminDashboard();
  const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly' | 'quarterly' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const displayStats = React.useMemo(() => {
    if (!stats || !stats.all_bookings) return null;

    const now = new Date();
    let minDate: Date | null = null;
    if (timeframe === 'weekly') {
      minDate = new Date();
      minDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'monthly') {
      minDate = new Date();
      minDate.setDate(now.getDate() - 30);
    } else if (timeframe === 'quarterly') {
      minDate = new Date();
      minDate.setDate(now.getDate() - 90);
    } else if (timeframe === 'custom') {
      if (customStart) minDate = new Date(customStart + 'T00:00:00');
    }

    let maxDate: Date | null = null;
    if (timeframe === 'custom' && customEnd) {
      maxDate = new Date(customEnd + 'T23:59:59');
    }

    const filteredBookings = stats.all_bookings.filter((b: Booking) => {
      if (!b.preferred_date) return true;
      const bDate = new Date(b.preferred_date + 'T00:00:00');
      if (minDate && bDate < minDate) return false;
      if (maxDate && bDate > maxDate) return false;
      return true;
    });

    const total_bookings = filteredBookings.length;
    const pending_bookings = filteredBookings.filter((b: Booking) => b.status === 'pending').length;
    const completed_bookings = filteredBookings.filter((b: Booking) => b.status === 'completed').length;
    const revenue_estimate = filteredBookings
      .filter((b: Booking) => ['confirmed', 'in-progress', 'completed'].includes(b.status))
      .reduce((sum: number, b: Booking) => sum + Number(b.total_price), 0);

    return {
      total_bookings,
      pending_bookings,
      completed_bookings,
      revenue_estimate: Math.round(revenue_estimate * 100) / 100,
      recent_bookings: filteredBookings.slice(0, 10),
      all_bookings: stats.all_bookings
    };
  }, [stats, timeframe, customStart, customEnd]);

  const { slotCounts, conflicts } = React.useMemo(() => {
    if (!stats || !stats.all_bookings) return { slotCounts: [], conflicts: [] };
    const counts: Record<string, { date: string; slot: string; count: number; bookings: Booking[] }> = {};
    
    stats.all_bookings.forEach((b: Booking) => {
      if (b.status === 'cancelled') return;
      const key = `${b.preferred_date}_${b.preferred_time}`;
      if (!counts[key]) {
        counts[key] = { date: b.preferred_date, slot: b.preferred_time, count: 0, bookings: [] };
      }
      counts[key].count += 1;
      counts[key].bookings.push(b);
    });
    
    const allCounts = Object.values(counts);
    const allConflicts = allCounts.filter(sc => sc.count > 1);
    
    return { slotCounts: allCounts, conflicts: allConflicts };
  }, [stats]);

  if (loading) return <AdminSkeleton />;
  if (error)   return <AdminError message={error} onRetry={refresh} />;
  if (!stats || !displayStats) return null;

  return (
    <div className="p-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase">Dashboard</h1>
          <p className="text-white/30 text-sm mt-1">Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={e => setTimeframe(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/20 font-sans"
          >
            <option value="all" className="bg-[#111]">All Time</option>
            <option value="weekly" className="bg-[#111]">Weekly (Last 7d)</option>
            <option value="monthly" className="bg-[#111]">Monthly (Last 30d)</option>
            <option value="quarterly" className="bg-[#111]">Quarterly (Last 90d)</option>
            <option value="custom" className="bg-[#111]">Custom Date Range</option>
          </select>

          {timeframe === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-sans"
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none font-sans"
              />
            </div>
          )}

          <button
            onClick={refresh}
            className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors ml-2"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Bookings"     value={String(displayStats.total_bookings)} />
        <StatCard label="Pending"            value={String(displayStats.pending_bookings)} highlight />
        <StatCard label="Completed"          value={String(displayStats.completed_bookings)} />
        <StatCard label="Revenue Estimate"   value={formatCurrency(displayStats.revenue_estimate)} />
      </div>

      {/* Double booking conflict alert banner */}
      {conflicts.length > 0 && (
        <div className="mb-8 p-5 border border-red-500/20 bg-red-500/5 rounded-xl">
          <h3 className="text-red-400 text-sm font-semibold tracking-wider uppercase mb-2 flex items-center gap-2">
            ⚠️ Double Booking Conflicts Detected
          </h3>
          <p className="text-xs text-white/50 mb-3">The following slots have multiple active bookings. Please review and reschedule:</p>
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
            {conflicts.map(c => (
              <div key={`${c.date}_${c.slot}`} className="text-xs flex justify-between items-center py-2 border-b border-white/5 last:border-b-0">
                <span>
                  <strong className="text-white">{formatDate(c.date)}</strong> at <strong className="text-white">{c.slot}</strong> ({c.count} bookings)
                </span>
                <span className="text-dp-gold font-mono">
                  {c.bookings.map(b => b.reference).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Pending Queue & Slot Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        
        {/* Left: Pending Requests Queue */}
        <div className="flex flex-col">
          <h2 className="text-xs tracking-[3px] text-white/40 uppercase mb-4">Pending Requests Queue</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01] flex-1">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#070707] border-b border-white/10 z-10">
                  <tr className="text-white/30 text-[10px] tracking-widest uppercase">
                    <th className="text-left px-5 py-3">Ref</th>
                    <th className="text-left px-5 py-3">Customer</th>
                    <th className="text-left px-5 py-3">Proposed Slot</th>
                    <th className="text-right px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.all_bookings || [])
                    .filter((b: Booking) => b.status === 'pending')
                    .map((b: Booking) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-2.5 font-mono text-xs text-dp-gold">{b.reference}</td>
                        <td className="px-5 py-2.5 text-white/80">{b.customer_name}</td>
                        <td className="px-5 py-2.5 text-white/50 text-xs">
                          {formatDate(b.preferred_date)} @ {b.preferred_time}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <a 
                            href={`/admin/bookings?search=${b.reference}`} 
                            className="text-xs text-white/50 hover:text-white underline transition-colors"
                          >
                            Review
                          </a>
                        </td>
                      </tr>
                    ))}
                  {(stats.all_bookings || []).filter((b: Booking) => b.status === 'pending').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-white/30 text-xs tracking-widest uppercase">
                        No pending requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Booking counts per slot/date */}
        <div className="flex flex-col">
          <h2 className="text-xs tracking-[3px] text-white/40 uppercase mb-4">Slot Load Density (Upcoming)</h2>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01] flex-1">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#070707] border-b border-white/10 z-10">
                  <tr className="text-white/30 text-[10px] tracking-widest uppercase">
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Time Slot</th>
                    <th className="text-left px-5 py-3">Load</th>
                    <th className="text-right px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slotCounts
                    .filter(sc => {
                      const d = new Date(sc.date + 'T00:00:00');
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return d >= today;
                    })
                    .sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot))
                    .slice(0, 15)
                    .map(sc => (
                      <tr key={`${sc.date}_${sc.slot}`} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-2.5 text-white/80">{formatDate(sc.date)}</td>
                        <td className="px-5 py-2.5 text-white/60">{sc.slot}</td>
                        <td className="px-5 py-2.5 text-white/50">{sc.count} booked</td>
                        <td className="px-5 py-2.5 text-right">
                          {sc.count > 1 ? (
                            <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider bg-red-400/10 px-2 py-0.5 rounded-full">Conflict</span>
                          ) : (
                            <span className="text-green-400 text-[10px] font-semibold uppercase tracking-wider bg-green-400/10 px-2 py-0.5 rounded-full">Occupied</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {slotCounts.filter(sc => {
                    const d = new Date(sc.date + 'T00:00:00');
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    return d >= today;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-white/30 text-xs tracking-widest uppercase">
                        No upcoming bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="text-xs tracking-[3px] text-white/40 uppercase mb-4">Recent Bookings</h2>
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/30 text-xs tracking-widest uppercase">
                <th className="text-left px-5 py-3">Reference</th>
                <th className="text-left px-5 py-3">Customer</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayStats.recent_bookings.map((b: Booking, i: number) => (
                <tr
                  key={b.id}
                  className={`border-b border-white/5 hover:bg-white/3 transition-colors ${
                    i === displayStats.recent_bookings.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-mono text-xs text-white/60">{b.reference}</td>
                  <td className="px-5 py-3 text-white/80">{b.customer_name}</td>
                  <td className="px-5 py-3 text-white/50">{formatDate(b.preferred_date)}</td>
                  <td className="px-5 py-3 text-white/80">{formatCurrency(b.total_price)}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {displayStats.recent_bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/30 text-xs tracking-widest uppercase">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────

function StatCard({ label, value, highlight = false }: {
  label:      string;
  value:      string;
  highlight?: boolean;
}) {
  return (
    <div className={`border rounded-xl p-5 ${highlight ? 'border-white/20 bg-white/5' : 'border-white/10'}`}>
      <p className="text-[10px] tracking-[2px] text-white/30 uppercase mb-2">{label}</p>
      <p className={`text-3xl font-light ${highlight ? 'text-white' : 'text-white/70'}`}>{value}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:     'bg-yellow-500/15 text-yellow-400',
    confirmed:   'bg-green-500/15 text-green-400',
    'in-progress': 'bg-purple-500/15 text-purple-400',
    completed:   'bg-blue-500/15 text-blue-400',
    cancelled:   'bg-red-500/15 text-red-400',
  };

  const labels: Record<string, string> = {
    pending: 'pending',
    confirmed: 'accepted',
    'in-progress': 'in-progress',
    completed: 'completed',
    cancelled: 'rejected',
  };

  const displayText = labels[status] ?? status;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] tracking-wider capitalize ${styles[status] ?? 'bg-white/10 text-white/40'}`}>
      {displayText}
    </span>
  );
}

function AdminSkeleton() {
  return (
    <div className="p-8">
      <div className="h-8 w-40 bg-white/5 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function AdminError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-8 text-center">
      <p className="text-red-400/70 text-sm mb-4">{message}</p>
      <button onClick={onRetry} className="text-xs text-white/40 hover:text-white/70 uppercase tracking-widest">
        Retry
      </button>
    </div>
  );
}

export { AdminSkeleton, AdminError };
