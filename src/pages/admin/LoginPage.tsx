/**
 * DETAIL PALS V2 — Admin Login Page
 * =====================================
 * File: src/pages/admin/LoginPage.tsx
 *
 * The staff/admin login page.
 * Preserves the V2 design language — dark, atmospheric, gold thread.
 * But it is operational, not cinematic: no intro, no particles.
 *
 * Handles:
 * - Zod-validated login form (email + password)
 * - Supabase signIn via AuthContext
 * - Redirects to intended destination after successful login
 * - Shows clear error messages for wrong credentials
 * - Loading state on the submit button
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { m } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/AuthContext'
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas'
import { springs } from '@/design-system'

export function AdminLoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const from = (location.state as { from?: string })?.from ?? '/admin'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const { error } = await signIn(data.email, data.password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setServerError('Incorrect email or password. Please try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setServerError('Please confirm your email address before logging in.')
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-dp-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 70% 20%, rgba(201,168,76,0.05) 0%, transparent 65%),
            radial-gradient(ellipse 50% 60% at 20% 80%, rgba(10,8,3,0.8) 0%, transparent 70%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
        aria-hidden="true"
      />

      <m.div
        className="relative z-10 w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.responsive}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-sans font-normal text-xs tracking-[0.28em] uppercase text-dp-text mb-2">
            DETAIL <span className="text-dp-gold font-medium">PALS</span>
          </p>
          <div className="w-16 h-px mx-auto" style={{
            background: 'linear-gradient(to right, transparent, var(--dp-gold), transparent)',
          }} aria-hidden="true" />
          <p className="font-sans font-light text-xs tracking-[0.16em] uppercase text-dp-text-muted mt-3">
            Staff portal
          </p>
        </div>

        {/* Card */}
        <div
          className="border border-[var(--dp-border)] p-8"
          style={{
            background: 'rgba(12,10,6,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Gold top accent */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(to right, transparent, var(--dp-gold) 30%, var(--dp-gold) 70%, transparent)',
          }} aria-hidden="true" />

          <h1 className="font-display font-light text-[28px] text-dp-text mb-1 leading-tight">
            Sign in
          </h1>
          <p className="font-sans font-light text-sm text-dp-text-muted mb-8">
            Access your Detail Pals dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans font-normal text-xs tracking-[0.10em] uppercase text-dp-text-muted mb-2"
                >
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@detailpals.com"
                  data-cursor="hide"
                  className={`
                    w-full border bg-[var(--dp-surface)] text-dp-text font-sans font-light text-sm px-4 py-3
                    focus:outline-none transition-colors duration-200
                    placeholder:text-dp-text-subtle
                    ${errors.email
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-[var(--dp-border)] focus:border-[var(--dp-gold)]'
                    }
                  `}
                />
                {errors.email && (
                  <p className="mt-1.5 font-sans font-light text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block font-sans font-normal text-xs tracking-[0.10em] uppercase text-dp-text-muted mb-2"
                >
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  data-cursor="hide"
                  className={`
                    w-full border bg-[var(--dp-surface)] text-dp-text font-sans font-light text-sm px-4 py-3
                    focus:outline-none transition-colors duration-200
                    placeholder:text-dp-text-subtle
                    ${errors.password
                      ? 'border-red-500/60 focus:border-red-400'
                      : 'border-[var(--dp-border)] focus:border-[var(--dp-gold)]'
                    }
                  `}
                />
                {errors.password && (
                  <p className="mt-1.5 font-sans font-light text-xs text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Server error */}
              {serverError && (
                <m.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-red-500/30 bg-red-950/20 px-4 py-3"
                >
                  <p className="font-sans font-light text-xs text-red-400">{serverError}</p>
                </m.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                data-cursor="cta"
                className={`
                  relative overflow-hidden w-full
                  font-sans font-normal text-sm tracking-[0.10em] uppercase
                  py-3 px-6 transition-all duration-300
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-dp-gold
                  ${isSubmitting
                    ? 'bg-dp-gold/40 text-dp-bg/60 cursor-not-allowed border border-dp-gold/30'
                    : 'bg-dp-gold text-dp-bg border border-dp-gold hover:bg-dp-gold-light hover:border-dp-gold-light cursor-pointer'
                  }
                `}
              >
                {/* Shimmer sweep */}
                {!isSubmitting && (
                  <span
                    className="absolute top-0 left-[-100%] w-[60%] h-full pointer-events-none group-hover:left-[160%] transition-[left] duration-500"
                    style={{
                      background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)',
                    }}
                    aria-hidden="true"
                  />
                )}
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <m.span
                      className="inline-block w-3 h-3 border border-dp-bg/40 rounded-full border-t-dp-bg"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>

            </div>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <a
            href="/#/"
            className="font-sans font-light text-xs text-dp-text-muted hover:text-dp-text transition-colors duration-200 no-underline"
          >
            ← Back to website
          </a>
        </p>
      </m.div>
    </div>
  )
}
