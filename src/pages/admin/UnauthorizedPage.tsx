import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { springs } from '@/design-system'

export function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen bg-dp-bg flex items-center justify-center px-6">
      <m.div className="text-center" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={springs.responsive}>
        <p className="font-sans font-normal text-xs tracking-[0.22em] uppercase text-dp-gold mb-4">Access denied</p>
        <h1 className="font-display font-light text-[40px] text-dp-text mb-4">Insufficient permissions</h1>
        <p className="font-sans font-light text-sm text-dp-text-muted mb-8">Your account does not have permission to access this area.</p>
        <Link to="/admin" className="font-sans font-normal text-xs tracking-[0.10em] uppercase text-dp-gold border border-[var(--dp-border-gold)] px-6 py-3 hover:bg-dp-gold hover:text-dp-bg transition-colors duration-200 no-underline">
          Back to dashboard
        </Link>
      </m.div>
    </div>
  )
}
