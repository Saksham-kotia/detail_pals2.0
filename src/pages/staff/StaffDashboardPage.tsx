import { m } from 'framer-motion'
import { springs } from '@/design-system'
import { useAuth } from '@/context/AuthContext'

export function StaffDashboardPage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-dp-bg p-8">
      <m.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={springs.responsive}>
        <p className="font-sans font-normal text-xs tracking-[0.14em] uppercase text-dp-gold mb-2">Staff portal</p>
        <h1 className="font-display font-light text-[28px] text-dp-text mb-2">Welcome, {user?.full_name}</h1>
        <p className="font-sans font-light text-sm text-dp-text-muted mb-8">Your assigned jobs and schedule will appear here in Phase 5.</p>
        <div className="border border-[var(--dp-border-gold-dim)] border-t-[var(--dp-border-gold)] p-6 bg-[var(--dp-surface)]">
          <p className="font-sans font-light text-xs text-dp-gold uppercase tracking-[0.12em] mb-2">Phase 5 implementation</p>
          <p className="font-sans font-light text-sm text-dp-text-muted">Staff dashboard — today's jobs, status updates, customer contact details.</p>
        </div>
      </m.div>
    </div>
  )
}
