/**
 * DETAIL PALS V2 — PageWrapper
 * ==============================
 * File: src/components/ui/PageWrapper.tsx
 *
 * Every page component is wrapped in this.
 * Applies the shared enter/exit animation variants.
 * Also adds proper scroll-to-top on route change.
 */

import { useEffect } from 'react'
import { m } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { pageVariants } from '@/hooks'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <m.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </m.div>
  )
}
