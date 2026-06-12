/**
 * DETAIL PALS V2 — Admin Layout
 * ================================
 * File: src/components/layout/AdminLayout.tsx
 *
 * The persistent shell for all admin pages.
 * Uses V2 design tokens but at operational density — not cinematic.
 * Sidebar navigation + top bar + content area.
 *
 * Visual language:
 * - Same dark palette and gold thread as the public site
 * - But: denser information, smaller text, no animations on data
 * - Gold accent on active nav item
 * - Frosted glass sidebar on mobile (slides in)
 */

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { springs } from '@/design-system'

interface NavItem {
  to:    string
  label: string
  icon:  string  // SVG path d= values
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin',              label: 'Dashboard',     icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { to: '/admin/bookings',     label: 'Bookings',      icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { to: '/admin/customers',    label: 'Customers',     icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  { to: '/admin/availability', label: 'Availability',  icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z' },
  { to: '/admin/gallery',      label: 'Gallery',       icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/admin/testimonials', label: 'Testimonials',  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/admin/services',     label: 'Services',      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/admin/staff',        label: 'Staff',         icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut, isAdmin } = useAuth()
  const navigate  = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-dp-bg flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 border-r border-[var(--dp-border)] bg-[rgba(10,8,5,0.95)]">
        <SidebarContent
          user={user}
          isAdmin={isAdmin}
          onSignOut={handleSignOut}
          onClose={() => {}}
        />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <m.aside
              className="fixed inset-y-0 left-0 z-50 w-[220px] flex flex-col lg:hidden border-r border-[var(--dp-border)]"
              style={{ background: 'rgba(10,8,5,0.98)', backdropFilter: 'blur(20px)' }}
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={springs.responsive}
            >
              <SidebarContent
                user={user}
                isAdmin={isAdmin}
                onSignOut={handleSignOut}
                onClose={() => setMobileOpen(false)}
              />
            </m.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-5 border-b border-[var(--dp-border)] bg-[rgba(7,7,7,0.9)]" style={{ backdropFilter: 'blur(12px)' }}>
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden flex flex-col gap-[4px] p-1 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle navigation"
          >
            <span className="block w-5 h-px bg-dp-text" />
            <span className="block w-5 h-px bg-dp-text" />
            <span className="block w-5 h-px bg-dp-text" />
          </button>

          <div className="hidden lg:block" />

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-sans font-normal text-xs text-dp-text leading-none">{user?.full_name}</p>
              <p className="font-sans font-light text-[10px] tracking-[0.10em] uppercase text-dp-gold mt-0.5 leading-none">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-[var(--dp-border-gold)] flex items-center justify-center bg-[var(--dp-surface)]">
              <span className="font-sans font-normal text-[11px] text-dp-gold">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Sidebar content ─────────────────────────────────────────

function SidebarContent({ user, isAdmin, onSignOut, onClose }: {
  user:       ReturnType<typeof useAuth>['user']
  isAdmin:    boolean
  onSignOut:  () => void
  onClose:    () => void
}) {
  const navItems = isAdmin ? ADMIN_NAV : ADMIN_NAV.filter(n =>
    ['/admin', '/admin/bookings'].includes(n.to)
  )

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 h-14 px-5 border-b border-[var(--dp-border)]">
        <span className="font-sans font-normal text-[11px] tracking-[0.24em] uppercase text-dp-text">
          DETAIL <span className="text-dp-gold font-medium">PALS</span>
        </span>
        <span className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-dp-text-subtle">
          admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        <ul className="space-y-1 list-none">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                onClick={onClose}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2 transition-colors duration-150 no-underline relative',
                  'font-sans font-normal text-xs',
                  isActive
                    ? 'text-dp-gold bg-[rgba(201,168,76,0.08)] border-l border-[var(--dp-gold)]'
                    : 'text-dp-text-muted hover:text-dp-text hover:bg-[var(--dp-surface)]',
                )}
              >
                {/* Icon */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-[var(--dp-border)]">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 font-sans font-normal text-xs text-dp-text-muted hover:text-dp-text hover:bg-[var(--dp-surface)] transition-colors duration-150 bg-transparent border-none cursor-pointer text-left"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </>
  )
}
