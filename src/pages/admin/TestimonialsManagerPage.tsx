import { m } from 'framer-motion'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { springs } from '@/design-system'

export function AdminTestimonialsManagerPage() {
  return (
    <AdminLayout>
      <m.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={springs.responsive}>
        <div className="mb-8">
          <p className="font-sans font-normal text-xs tracking-[0.14em] uppercase text-dp-gold mb-1">Admin</p>
          <h1 className="font-display font-light text-[28px] text-dp-text">TestimonialsManager</h1>
        </div>
        <div className="border border-[var(--dp-border-gold-dim)] border-t-[var(--dp-border-gold)] p-6 bg-[var(--dp-surface)]">
          <p className="font-sans font-normal text-xs tracking-[0.14em] uppercase text-dp-gold mb-2">Phase 4 implementation</p>
          <p className="font-sans font-light text-sm text-dp-text-muted leading-[1.75]">
            Full TestimonialsManager management UI coming in Phase 4. Auth and routing are live.
          </p>
        </div>
      </m.div>
    </AdminLayout>
  )
}
