import React, { useState } from 'react';
import type { Booking, BookingStatus } from '../../lib/types';
import { useAdminBookings } from '../../hooks/useBackend';
import { StatusBadge } from './AdminDashboard';
import { formatDate, formatCurrency, formatDateTime } from '../components/adminUtils';

export default function AdminHistory() {
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState<BookingStatus | 'all'>('all');
  const [selected,   setSelected]   = useState<Booking | null>(null);
  const [page,       setPage]       = useState(1);

  const { bookings, count, loading, refresh } = useAdminBookings({
    search,
    status: statusFilter,
    page,
    pageSize: 20,
  });

  return (
    <div className="p-8 text-white flex gap-6 h-screen overflow-hidden">
      {/* Left: table */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-light tracking-widest uppercase">Booking History</h1>
            <p className="text-white/30 text-sm mt-1">{count} total entries</p>
          </div>
          <button
            onClick={refresh}
            className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 shrink-0">
          <input
            type="text"
            placeholder="Search reference…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20"
          />
          <select
            value={statusFilter}
            onChange={e => { setStatus(e.target.value as BookingStatus | 'all'); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none font-sans"
          >
            <option value="all" className="bg-[#111]">All Statuses</option>
            <option value="pending" className="bg-[#111]">Pending (Awaited)</option>
            <option value="confirmed" className="bg-[#111]">Accepted</option>
            <option value="in-progress" className="bg-[#111]">In Progress</option>
            <option value="completed" className="bg-[#111]">Completed</option>
            <option value="cancelled" className="bg-[#111]">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="border border-white/10 rounded-xl overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0a0a0a]">
                <tr className="border-b border-white/10 text-white/30 text-[11px] tracking-widest uppercase">
                  <th className="text-left px-5 py-3">Ref</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={`border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors ${
                      selected?.id === b.id ? 'bg-white/5' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-white/50">{b.reference}</td>
                    <td className="px-5 py-3 text-white/80">{b.customer_name}</td>
                    <td className="px-5 py-3 text-white/50">{formatDate(b.preferred_date)}</td>
                    <td className="px-5 py-3 text-white/80">{formatCurrency(b.total_price)}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-white/20 text-xs tracking-widest uppercase">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {count > 20 && (
          <div className="flex items-center justify-between mt-4 shrink-0">
            <p className="text-white/30 text-xs">Page {page} of {Math.ceil(count / 20)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-white/10 rounded disabled:opacity-20 hover:bg-white/5"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(count / 20)}
                className="px-3 py-1.5 text-xs border border-white/10 rounded disabled:opacity-20 hover:bg-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      {selected && (
        <aside className="w-80 shrink-0 border border-white/10 rounded-xl overflow-y-auto p-6 bg-[#0e0e0e]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-mono text-sm text-white/50">{selected.reference}</p>
              <StatusBadge status={selected.status} />
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-white/30 hover:text-white/60 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <Section title="Customer">
            <Field label="Name"  value={selected.customer_name}  />
            <Field label="Email" value={selected.customer_email} />
            <Field label="Phone" value={selected.customer_phone} />
          </Section>

          <Section title="Vehicle">
            <Field label="Type"      value={selected.vehicle_type} />
            <Field label="Make"      value={selected.vehicle_make} />
            <Field label="Model"     value={selected.vehicle_model} />
            <Field label="Year"      value={selected.vehicle_year} />
            <Field label="Condition" value={selected.vehicle_condition} />
            {selected.condition_notes && (
              <Field label="Notes" value={selected.condition_notes} />
            )}
          </Section>

          <Section title="Appointment">
            <Field label="Date" value={formatDate(selected.preferred_date)} />
            <Field label="Time" value={selected.preferred_time} />
          </Section>

          <Section title="Services">
            {selected.services.map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-white/70">{s.name}</span>
                <span className="text-white/50">{formatCurrency(s.price)}</span>
              </div>
            ))}
            {selected.addons.map((a, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-white/40">{a.name} (add-on)</span>
                <span className="text-white/30">{formatCurrency(a.price)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 mt-1 border-t border-white/10 font-medium">
              <span className="text-white/80">Total</span>
              <span className="text-white">{formatCurrency(selected.total_price)}</span>
            </div>
          </Section>

          <p className="mt-6 text-[10px] text-white/20">
            Created {formatDateTime(selected.created_at)}
          </p>
        </aside>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] tracking-[2px] text-white/30 uppercase mb-2">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-white/30">{label}</span>
      <span className="text-white/70 capitalize">{value}</span>
    </div>
  );
}
