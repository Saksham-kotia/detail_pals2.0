/**
 * DETAIL PALS V2 — Admin Dashboard
 * File: src/pages/admin/DashboardPage.tsx
 *
 * KPI summary: today's bookings, pending confirmations,
 * this week's revenue, occupancy. Live from Supabase in Phase 4.
 */
import { m } from 'framer-motion'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { springs } from '@/design-system'

const KPI_CARDS = [
  { label: "Today's bookings", value: '—', note: 'Connect Supabase to see live data' },
  { label: 'Pending confirmation', value: '—', note: 'Phase 4 implementation' },
  { label: 'This week revenue',  value: '—', note: 'Phase 4 implementation' },
  { label: 'Completed this month', value: '—', note: 'Phase 4 implementation' },
]

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <m.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={springs.responsive}>
        <div className="mb-8">
          <p className="font-sans font-normal text-xs tracking-[0.14em] uppercase text-dp-gold mb-1">Overview</p>
          <h1 className="font-display font-light text-[28px] text-dp-text">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map(card => (
            <div key={card.label} className="border border-[var(--dp-border)] p-5 bg-[var(--dp-surface)]">
              <div className="w-4 h-px bg-dp-gold mb-4" />
              <p className="font-sans font-normal text-xs tracking-[0.08em] uppercase text-dp-text-muted mb-2">{card.label}</p>
              <p className="font-sans font-light text-[28px] text-dp-text leading-none mb-1">{card.value}</p>
              <p className="font-sans font-light text-xs text-dp-text-subtle">{card.note}</p>
            </div>
          ))}
        </div>

        <div className="border border-[var(--dp-border-gold-dim)] border-t-[var(--dp-border-gold)] p-6 bg-[var(--dp-surface)]">
          <p className="font-sans font-normal text-xs tracking-[0.14em] uppercase text-dp-gold mb-2">Phase 1 complete</p>
          <p className="font-sans font-light text-sm text-dp-text-muted leading-[1.75] max-w-[560px]">
            Authentication, routing, and the admin shell are live. Connect your Supabase project using
            the <code className="font-mono text-xs text-dp-gold">.env.local</code> file, then Phase 2
            will wire up real booking submission, availability, and this dashboard's live data.
          </p>
        </div>
      </m.div>
    </AdminLayout>
  )
}
