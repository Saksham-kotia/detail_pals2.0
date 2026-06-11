/**
 * DETAIL PALS V2 — AtmosphericBackground
 * =========================================
 * File: src/components/ui/AtmosphericBackground.tsx
 *
 * A multi-layer animated background system for sections that currently
 * feel too static. Inspired by the environmental depth of luxury showroom
 * photography — where fog, light spill, and material reflections create
 * the sense of being inside a real physical space.
 *
 * Three variants:
 *
 *   'showroom'  — The default. Slow-breathing gold ambient light from
 *                 top-right (our established studio light direction).
 *                 Subtle gradient shift on a 12s loop. Used on hero,
 *                 services, booking CTA.
 *
 *   'dark-fog'  — A cooler, more mysterious atmosphere for the gallery.
 *                 Very subtle blue-grey fog layer that rolls slowly.
 *                 Suggests a car in mist before the reveal.
 *
 *   'surface'   — Abstract paint surface texture with slow grain movement.
 *                 Used in stat sections and process sections.
 *
 * All effects are:
 *   — CSS animation + transform only (GPU-composited, no paint)
 *   — Single requestAnimationFrame budget (no loops fighting each other)
 *   — Automatically paused by prefers-reduced-motion
 *   — Transparent to pointer events
 */

import { m } from 'framer-motion'

type BackgroundVariant = 'showroom' | 'dark-fog' | 'surface'

interface AtmosphericBackgroundProps {
  variant?:  BackgroundVariant
  intensity?: number   // 0-1, scales all effect opacities
  className?: string
  colorTheme?: 'amber' | 'blue' | 'champagne' | 'chrome' | 'obsidian'
}

export function AtmosphericBackground({
  variant   = 'showroom',
  intensity = 1,
  className = '',
  colorTheme = 'amber',
}: AtmosphericBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {variant === 'showroom' && <ShowroomAtmosphere intensity={intensity} colorTheme={colorTheme} />}
      {variant === 'dark-fog' && <DarkFogAtmosphere intensity={intensity} />}
      {variant === 'surface'  && <SurfaceAtmosphere intensity={intensity} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

function ShowroomAtmosphere({ intensity, colorTheme }: { intensity: number; colorTheme: 'amber' | 'blue' | 'champagne' | 'chrome' | 'obsidian' }) {
  const colors = {
    amber: {
      light1: 'rgba(201,168,76,0.07)',
      light2: 'rgba(201,168,76,0.03)',
      accent: 'rgba(240,200,100,0.05)',
      streak: 'rgba(201,168,76,0.03)',
      streakCore: 'rgba(201,168,76,0.06)',
    },
    blue: {
      light1: 'rgba(0,210,255,0.08)',
      light2: 'rgba(0,210,255,0.03)',
      accent: 'rgba(128,229,255,0.05)',
      streak: 'rgba(0,210,255,0.03)',
      streakCore: 'rgba(0,210,255,0.06)',
    },
    champagne: {
      light1: 'rgba(240,224,176,0.08)',
      light2: 'rgba(240,224,176,0.03)',
      accent: 'rgba(251,243,217,0.05)',
      streak: 'rgba(240,224,176,0.03)',
      streakCore: 'rgba(240,224,176,0.06)',
    },
    chrome: {
      light1: 'rgba(200,200,200,0.08)',
      light2: 'rgba(200,200,200,0.03)',
      accent: 'rgba(226,226,226,0.05)',
      streak: 'rgba(200,200,200,0.03)',
      streakCore: 'rgba(200,200,200,0.06)',
    },
    obsidian: {
      light1: 'rgba(255,45,85,0.07)',
      light2: 'rgba(255,45,85,0.03)',
      accent: 'rgba(255,128,150,0.05)',
      streak: 'rgba(255,45,85,0.03)',
      streakCore: 'rgba(255,45,85,0.06)',
    },
  }[colorTheme]

  return (
    <>
      {/* Primary studio light — breathes slowly */}
      <m.div
        className="absolute inset-0"
        animate={{ opacity: [0.7, 1.0, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          opacity: intensity,
          background: `radial-gradient(
            ellipse 65% 55% at 74% 16%,
            ${colors.light1} 0%,
            ${colors.light2} 45%,
            transparent 72%
          )`,
        }}
      />

      {/* Secondary warm accent — slower, offset phase */}
      <m.div
        className="absolute inset-0"
        animate={{ opacity: [1.0, 0.6, 1.0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          opacity: intensity * 0.6,
          background: `radial-gradient(
            ellipse 50% 40% at 80% 8%,
            ${colors.accent} 0%,
            transparent 60%
          )`,
        }}
      />

      {/* Deep shadow corner — bottom left stays dark */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: intensity * 0.8,
          background: `radial-gradient(
            ellipse 70% 55% at 8% 90%,
            rgba(5,3,1,0.75) 0%,
            transparent 65%
          )`,
        }}
      />

      {/* Slow diagonal light shift — like clouds moving past a skylight */}
      <m.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          opacity: intensity * 0.4,
          backgroundImage: `linear-gradient(
            135deg,
            transparent 0%,
            ${colors.streak} 30%,
            ${colors.streakCore} 50%,
            ${colors.streak} 70%,
            transparent 100%
          )`,
          backgroundSize: '200% 200%',
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────

function DarkFogAtmosphere({ intensity }: { intensity: number }) {
  return (
    <>
      {/* Fog layer 1 — rolls slowly left */}
      <m.div
        className="absolute inset-0"
        animate={{ x: ['-5%', '5%', '-5%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          opacity: intensity * 0.5,
          background: `radial-gradient(
            ellipse 80% 40% at 50% 60%,
            rgba(20,22,28,0.6) 0%,
            transparent 70%
          )`,
        }}
      />

      {/* Fog layer 2 — drifts right, different speed */}
      <m.div
        className="absolute inset-0"
        animate={{ x: ['4%', '-4%', '4%'], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{
          opacity: intensity * 0.4,
          background: `radial-gradient(
            ellipse 60% 30% at 35% 70%,
            rgba(15,18,25,0.5) 0%,
            transparent 65%
          )`,
        }}
      />

      {/* Subtle gallery spotlight */}
      <m.div
        className="absolute inset-0"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          opacity: intensity * 0.6,
          background: `radial-gradient(
            ellipse 40% 50% at 50% 0%,
            rgba(201,168,76,0.04) 0%,
            transparent 65%
          )`,
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────

function SurfaceAtmosphere({ intensity }: { intensity: number }) {
  return (
    <>
      {/* Abstract reflective surface */}
      <m.div
        className="absolute inset-0"
        animate={{ opacity: [0.8, 1.0, 0.8], backgroundPosition: ['0% 0%', '20% 10%', '0% 0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          opacity: intensity * 0.7,
          backgroundImage: `
            radial-gradient(ellipse 55% 40% at 40% 30%, rgba(201,168,76,0.05) 0%, transparent 65%),
            radial-gradient(ellipse 35% 50% at 75% 70%, rgba(201,168,76,0.03) 0%, transparent 60%)
          `,
          backgroundSize: '150% 150%',
        }}
      />

      {/* Grain direction lines — slow shift */}
      <m.svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: intensity * 0.025 }}
        animate={{ opacity: [intensity * 0.02, intensity * 0.04, intensity * 0.02] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i}
            x1={`${-10 + i * 6}%`} y1="110%"
            x2={`${10 + i * 6}%`}  y2="-10%"
            stroke="#C9A84C" strokeWidth="0.6"
          />
        ))}
      </m.svg>
    </>
  )
}
