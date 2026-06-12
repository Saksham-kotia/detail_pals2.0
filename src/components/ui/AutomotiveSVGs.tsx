/**
 * DETAIL PALS V2 — Automotive SVG Assets
 * ==========================================
 * File: src/components/ui/AutomotiveSVGs.tsx
 *
 * All cinematic automotive visual assets, built as SVG components.
 * These replace the need for photography by using SVG gradients,
 * careful layering, and the same asymmetric studio-light direction
 * established in the hero section (warm amber from top-right).
 *
 * Each component is self-contained and can be placed absolutely
 * within a section as an atmospheric visual layer.
 *
 * Components:
 *   CarSilhouette     — Dark luxury sedan with raking studio light
 *   WaterDroplet      — Macro water bead on paint surface
 *   ChromeStreak      — Light streak / chrome reflection
 *   PolishOrb         — Circular polishing light caustic
 *   SurfaceTexture    — Metallic paint grain detail
 *   WheelDetail       — Luxury alloy wheel close-up
 *   FloatingDataCard  — Animated spec/stat display card
 */

import { m } from 'framer-motion'

// ─────────────────────────────────────────────────────────────
// CarSilhouette — Dark luxury sedan with studio lighting
// ─────────────────────────────────────────────────────────────

export function CarSilhouette({
  className,
  opacity = 1,
  colorTheme = 'amber',
  blueprint = false,
  activeColor = 'var(--dp-gold)',
}: {
  className?: string
  opacity?: number
  colorTheme?: 'amber' | 'blue' | 'champagne' | 'chrome' | 'obsidian'
  blueprint?: boolean
  activeColor?: string
}) {
  const theme = {
    amber: {
      body1: '#2A2218', body2: '#1E1A12', body3: '#0F0D08',
      roof1: '#C9A84C', roof2: '#8A7A3A',
      edge1: '#E8C97A', edge2: '#C9A84C',
      wheel1: '#3A3228', wheel2: '#1A1610',
    },
    blue: {
      body1: '#0F1C28', body2: '#0A131C', body3: '#050A10',
      roof1: '#00D2FF', roof2: '#007AA8',
      edge1: '#80E5FF', edge2: '#00D2FF',
      wheel1: '#1E2C38', wheel2: '#0F1822',
    },
    champagne: {
      body1: '#262118', body2: '#1C1912', body3: '#0E0D09',
      roof1: '#F0E0B0', roof2: '#A89970',
      edge1: '#FBF3D9', edge2: '#F0E0B0',
      wheel1: '#3A362E', wheel2: '#1D1B17',
    },
    chrome: {
      body1: '#222222', body2: '#181818', body3: '#0B0B0B',
      roof1: '#FFFFFF', roof2: '#888888',
      edge1: '#E2E2E2', edge2: '#C0C0C0',
      wheel1: '#333333', wheel2: '#181818',
    },
    obsidian: {
      body1: '#1E0E10', body2: '#13090A', body3: '#0A0506',
      roof1: '#FF2D55', roof2: '#A81A33',
      edge1: '#FF8096', edge2: '#FF2D55',
      wheel1: '#2B1E20', wheel2: '#150F10',
    },
  }[colorTheme]

  return (
    <svg
      viewBox="0 0 900 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        {/* Main body gradient */}
        <linearGradient id="car-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={theme.body1} stopOpacity="0.95" />
          <stop offset="35%"  stopColor={theme.body2} stopOpacity="0.90" />
          <stop offset="70%"  stopColor={theme.body3} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#070707" stopOpacity="0.80" />
        </linearGradient>
        {/* Roof highlight */}
        <linearGradient id="car-roof" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={theme.roof1} stopOpacity="0.12" />
          <stop offset="30%"  stopColor={theme.roof2} stopOpacity="0.06" />
          <stop offset="100%" stopColor="#070707" stopOpacity="0" />
        </linearGradient>
        {/* Window reflections */}
        <linearGradient id="window-reflect" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={theme.roof1} stopOpacity="0.18" />
          <stop offset="40%"  stopColor={theme.roof2} stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.90" />
        </linearGradient>
        {/* Underbody shadow */}
        <linearGradient id="car-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor="#070707" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>
        {/* Edge highlight */}
        <linearGradient id="body-edge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={theme.roof2} stopOpacity="0" />
          <stop offset="30%"  stopColor={theme.edge1} stopOpacity="0.35" />
          <stop offset="60%"  stopColor={theme.edge2} stopOpacity="0.20" />
          <stop offset="100%" stopColor={theme.roof2} stopOpacity="0" />
        </linearGradient>
        {/* Wheel gradient */}
        <radialGradient id="wheel-grad" cx="50%" cy="40%" r="55%">
          <stop offset="0%"  stopColor={theme.wheel1} stopOpacity="0.9" />
          <stop offset="60%" stopColor={theme.wheel2} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#080707" stopOpacity="1" />
        </radialGradient>
        {/* Floor reflection */}
        <linearGradient id="floor-reflect" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor={theme.wheel2} stopOpacity="0.5" />
          <stop offset="100%" stopColor="#070707" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Floor reflection ── */}
      {!blueprint && <ellipse cx="450" cy="395" rx="340" ry="18" fill="url(#floor-reflect)" />}

      {/* ── Main body ── */}
      {/* Underbody / sill */}
      <path
        d="M 120 310 L 780 310 L 780 330 Q 760 345 700 348 L 580 350 L 320 350 Q 260 350 200 345 L 140 338 Z"
        fill={blueprint ? "none" : "url(#car-body)"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1.2 : 0}
        strokeOpacity={blueprint ? 0.35 : 0}
      />

      {/* Body side — the main panel */}
      <path
        d="M 130 225 
           Q 135 215 150 208 
           L 280 200 
           Q 320 185 370 175
           L 480 168
           Q 560 162 610 168
           L 680 178
           Q 730 188 760 200
           L 790 215
           Q 800 225 800 240
           L 800 310
           L 120 310
           Z"
        fill={blueprint ? "none" : "url(#car-body)"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1.2 : 0}
        strokeOpacity={blueprint ? 0.45 : 0}
      />

      {/* Roof */}
      <path
        d="M 280 200
           Q 310 155 350 135
           L 420 122
           Q 470 112 530 115
           L 590 122
           Q 640 132 665 150
           L 700 178
           L 610 168
           Q 560 162 480 168
           L 370 175
           Q 320 185 280 200Z"
        fill={blueprint ? "none" : "url(#car-body)"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1.2 : 0}
        strokeOpacity={blueprint ? 0.4 : 0}
      />

      {/* Roof light gloss */}
      {!blueprint && (
        <path
          d="M 310 192
             Q 330 160 365 140
             L 430 126
             Q 480 116 535 118
             L 590 126
             Q 630 136 655 152
             L 680 170
             Q 640 138 590 128
             L 535 122
             Q 478 118 428 128
             L 365 144
             Q 330 162 310 192Z"
          fill="url(#car-roof)"
        />
      )}

      {/* Body character line — the raised ridge that catches light */}
      <path
        d="M 145 265 Q 300 255 450 252 Q 600 250 760 258"
        stroke={blueprint ? activeColor : "url(#body-edge)"}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeOpacity={blueprint ? 0.6 : 1}
      />

      {/* Front window */}
      <path
        d="M 350 178
           L 390 135
           Q 420 118 460 115
           L 460 172
           Q 420 170 390 175
           Z"
        fill={blueprint ? "none" : "url(#window-reflect)"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1 : 0}
        strokeOpacity={blueprint ? 0.35 : 0.8}
      />

      {/* Rear window */}
      <path
        d="M 540 172
           L 540 115
           Q 580 118 620 132
           L 665 155
           L 640 178
           Q 610 170 570 170
           Z"
        fill={blueprint ? "none" : "url(#window-reflect)"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1 : 0}
        strokeOpacity={blueprint ? 0.3 : 0.6}
      />

      {/* B-pillar */}
      <rect 
        x="518" y="118" width="22" height="58" 
        fill={blueprint ? "none" : "#0A0907"} 
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1 : 0}
        strokeOpacity={blueprint ? 0.3 : 0.95} 
      />

      {/* Windshield glare — top edge catches the studio light */}
      {!blueprint && (
        <path
          d="M 355 174 Q 395 132 460 115 L 465 118 Q 400 136 360 176 Z"
          fill="#E8C97A"
          opacity="0.08"
        />
      )}

      {/* Front wheel arch */}
      <path
        d="M 175 310 Q 175 248 240 248 Q 305 248 305 310 Z"
        fill={blueprint ? "none" : "#0A0907"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1.2 : 0}
        strokeOpacity={blueprint ? 0.4 : 0}
      />
      {/* Rear wheel arch */}
      <path
        d="M 590 310 Q 590 248 655 248 Q 720 248 720 310 Z"
        fill={blueprint ? "none" : "#0A0907"}
        stroke={blueprint ? activeColor : "none"}
        strokeWidth={blueprint ? 1.2 : 0}
        strokeOpacity={blueprint ? 0.4 : 0}
      />

      {/* Front wheel */}
      <circle cx="240" cy="325" r="52" fill={blueprint ? "none" : "url(#wheel-grad)"} stroke={blueprint ? activeColor : "#2A2218"} strokeWidth={blueprint ? 1.2 : 2} />
      {/* Wheel rim detail */}
      <circle cx="240" cy="325" r="26" fill="none" stroke={blueprint ? activeColor : "#3A3028"} strokeWidth={blueprint ? 1 : 8} strokeOpacity={blueprint ? 0.5 : 1} />
      <circle cx="240" cy="325" r="14" fill={blueprint ? "none" : "#1A1610"} stroke={blueprint ? activeColor : "none"} strokeWidth={blueprint ? 1 : 0} strokeOpacity={blueprint ? 0.4 : 0} />
      {/* Spokes */}
      {[0,60,120,180,240,300].map(angle => (
        <line key={angle}
          x1={240 + 14 * Math.cos(angle * Math.PI/180)}
          y1={325 + 14 * Math.sin(angle * Math.PI/180)}
          x2={240 + 35 * Math.cos(angle * Math.PI/180)}
          y2={325 + 35 * Math.sin(angle * Math.PI/180)}
          stroke={blueprint ? activeColor : "#4A4030"}
          strokeWidth={blueprint ? 1 : 3}
          strokeLinecap="round"
          strokeOpacity={blueprint ? 0.5 : 1}
        />
      ))}
      {/* Wheel highlight */}
      {!blueprint && <ellipse cx="228" cy="312" rx="16" ry="10" fill="#C9A84C" opacity="0.08" transform="rotate(-25 228 312)" />}

      {/* Rear wheel */}
      <circle cx="655" cy="325" r="52" fill={blueprint ? "none" : "url(#wheel-grad)"} stroke={blueprint ? activeColor : "#2A2218"} strokeWidth={blueprint ? 1.2 : 2} />
      <circle cx="655" cy="325" r="26" fill="none" stroke={blueprint ? activeColor : "#3A3028"} strokeWidth={blueprint ? 1 : 8} strokeOpacity={blueprint ? 0.5 : 1} />
      <circle cx="655" cy="325" r="14" fill={blueprint ? "none" : "#1A1610"} stroke={blueprint ? activeColor : "none"} strokeWidth={blueprint ? 1 : 0} strokeOpacity={blueprint ? 0.4 : 0} />
      {[0,60,120,180,240,300].map(angle => (
        <line key={angle}
          x1={655 + 14 * Math.cos(angle * Math.PI/180)}
          y1={325 + 14 * Math.sin(angle * Math.PI/180)}
          x2={655 + 35 * Math.cos(angle * Math.PI/180)}
          y2={325 + 35 * Math.sin(angle * Math.PI/180)}
          stroke={blueprint ? activeColor : "#4A4030"}
          strokeWidth={blueprint ? 1 : 3}
          strokeLinecap="round"
          strokeOpacity={blueprint ? 0.5 : 1}
        />
      ))}
      {!blueprint && <ellipse cx="643" cy="312" rx="16" ry="10" fill="#C9A84C" opacity="0.07" transform="rotate(-25 643 312)" />}

      {/* Headlight cluster */}
      <path d="M 790 235 L 805 248 L 805 270 L 790 278 Q 798 260 790 248 Z" fill={blueprint ? "none" : "#1A1610"} stroke={blueprint ? activeColor : "none"} strokeWidth={blueprint ? 1 : 0} strokeOpacity={blueprint ? 0.3 : 1} />
      {!blueprint && <path d="M 792 250 L 800 255 L 800 265 L 792 268 Z" fill="#C9A84C" opacity="0.4" />}

      {/* Grille */}
      <path d="M 802 248 L 808 255 L 808 268 L 802 272 Z" fill={blueprint ? "none" : "#0D0B08"} stroke={blueprint ? activeColor : "none"} strokeWidth={blueprint ? 1 : 0} strokeOpacity={blueprint ? 0.3 : 1} />
      {!blueprint && [255,259,263,267].map(y => (
        <line key={y} x1="802" y1={y} x2="808" y2={y} stroke="#2A2218" strokeWidth="0.8" />
      ))}

      {/* Tail light */}
      <path d="M 112 240 L 124 238 L 124 260 L 112 265 Z" fill={blueprint ? "none" : "#1A1610"} stroke={blueprint ? activeColor : "none"} strokeWidth={blueprint ? 1 : 0} strokeOpacity={blueprint ? 0.3 : 1} />
      {!blueprint && <path d="M 113 244 L 122 242 L 122 258 L 113 262 Z" fill="#8B2020" opacity="0.5" />}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// WaterDroplet — macro water bead on dark paint
// ─────────────────────────────────────────────────────────────

export function WaterDroplet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="drop-surface" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#2A2412" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#141208" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#070707" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="drop-body" cx="35%" cy="28%" r="70%">
          <stop offset="0%"   stopColor="rgba(200,220,255,0.85)" />
          <stop offset="30%"  stopColor="rgba(160,190,230,0.70)" />
          <stop offset="70%"  stopColor="rgba(100,130,180,0.50)" />
          <stop offset="100%" stopColor="rgba(60,90,150,0.30)" />
        </radialGradient>
        <radialGradient id="drop-specular" cx="32%" cy="26%" r="30%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.95)" />
          <stop offset="60%"  stopColor="rgba(255,255,255,0.40)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="drop-gold-reflect" cx="70%" cy="72%" r="35%">
          <stop offset="0%"   stopColor="rgba(201,168,76,0.5)" />
          <stop offset="100%" stopColor="rgba(201,168,76,0)" />
        </radialGradient>
        <filter id="drop-blur">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* Dark paint surface */}
      <rect width="200" height="200" fill="url(#drop-surface)" />
      {/* Surface grain lines */}
      {[60,75,90,105,120].map(y => (
        <line key={y} x1="0" y1={y} x2="200" y2={y-8} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      ))}

      {/* Main droplet body */}
      <ellipse cx="100" cy="105" rx="52" ry="48" fill="url(#drop-body)" />

      {/* Shadow/contact point beneath droplet */}
      <ellipse cx="104" cy="150" rx="36" ry="6" fill="rgba(0,0,0,0.4)" filter="url(#drop-blur)" />

      {/* Gold paint reflection inside droplet */}
      <ellipse cx="115" cy="122" rx="22" ry="18" fill="url(#drop-gold-reflect)" />

      {/* Primary specular highlight — the "white hot" point */}
      <ellipse cx="84" cy="84" rx="14" ry="11" fill="url(#drop-specular)" transform="rotate(-20 84 84)" />

      {/* Secondary specular — smaller, brighter */}
      <ellipse cx="78" cy="78" rx="5" ry="4" fill="rgba(255,255,255,0.95)" />

      {/* Meniscus edge highlight */}
      <ellipse cx="100" cy="105" rx="52" ry="48" fill="none"
        stroke="rgba(200,215,245,0.25)" strokeWidth="1.5" />

      {/* Small satellite droplets */}
      <ellipse cx="162" cy="88" rx="12" ry="11" fill="url(#drop-body)" opacity="0.7" />
      <ellipse cx="158" cy="85" rx="4" ry="3" fill="rgba(255,255,255,0.8)" />

      <ellipse cx="52" cy="148" rx="8" ry="7" fill="url(#drop-body)" opacity="0.6" />
      <ellipse cx="49" cy="146" rx="3" ry="2.5" fill="rgba(255,255,255,0.75)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// ChromeStreak — light streak across a polished surface
// ─────────────────────────────────────────────────────────────

export function ChromeStreak({
  className,
  angle = -15,
}: {
  className?: string
  angle?: number
}) {
  return (
    <svg viewBox="0 0 600 120" className={className} aria-hidden="true"
      style={{ transform: `rotate(${angle}deg)` }}>
      <defs>
        <linearGradient id="streak-main" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0" />
          <stop offset="20%"  stopColor="#C9A84C" stopOpacity="0.06" />
          <stop offset="45%"  stopColor="#E8C97A" stopOpacity="0.18" />
          <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="70%"  stopColor="#E8C97A" stopOpacity="0.12" />
          <stop offset="90%"  stopColor="#C9A84C" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="streak-core" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="40%"  stopColor="white" stopOpacity="0.08" />
          <stop offset="50%"  stopColor="white" stopOpacity="0.30" />
          <stop offset="60%"  stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Wide glow halo */}
      <rect x="0" y="15" width="600" height="90" fill="url(#streak-main)" rx="45" />
      {/* Tight bright core */}
      <rect x="0" y="52" width="600" height="16" fill="url(#streak-core)" rx="8" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// PolishOrb — circular caustic of polishing light
// ─────────────────────────────────────────────────────────────

export function PolishOrb({ className, size = 300 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 300 300" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id="orb-outer" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.12" />
          <stop offset="40%"  stopColor="#C9A84C" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orb-inner" cx="38%" cy="32%" r="40%">
          <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0.15" />
          <stop offset="50%"  stopColor="#E8C97A"  stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C9A84C"  stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Concentric circles — polisher pad suggestion */}
      {[130, 100, 72, 48, 28, 14].map((r) => (
        <circle key={r} cx="150" cy="150" r={r}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="0.5"
          opacity={0.06 + (130 - r) / 130 * 0.06}
        />
      ))}
      {/* Outer glow */}
      <circle cx="150" cy="150" r="130" fill="url(#orb-outer)" />
      {/* Inner bright caustic */}
      <circle cx="150" cy="150" r="80" fill="url(#orb-inner)" />
      {/* Specular hot spot */}
      <ellipse cx="120" cy="118" rx="28" ry="20"
        fill="rgba(255,255,255,0.08)"
        transform="rotate(-20 120 118)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// FloatingSpecCard — animated floating specification card
// ─────────────────────────────────────────────────────────────

interface SpecCardProps {
  label:     string
  value:     string
  unit?:     string
  delay?:    number
  className?: string
}

export function FloatingSpecCard({ label, value, unit, delay = 0, className }: SpecCardProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 80, damping: 18 }}
    >
      <m.div
        className="px-4 py-3 border border-[var(--dp-border-gold-dim)] hover:border-[var(--dp-border-gold)] transition-colors duration-500"
        style={{
          background: 'rgba(12,10,6,0.85)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
      >
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-dp-gold opacity-60" aria-hidden="true" />
        <p className="font-sans font-normal text-[9px] tracking-[0.18em] uppercase text-dp-text-muted mb-1">{label}</p>
        <p className="font-sans font-light text-lg leading-none tracking-[-0.01em] text-dp-text">
          {value}
          {unit && <span className="text-dp-gold text-sm ml-1">{unit}</span>}
        </p>
      </m.div>
    </m.div>
  )
}

// ─────────────────────────────────────────────────────────────
// SectionDividerLight — atmospheric light streak between sections
// ─────────────────────────────────────────────────────────────

export function SectionDividerLight({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <m.div
        className="w-full h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4) 30%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0.4) 70%, transparent)',
          boxShadow: '0 0 12px rgba(201,168,76,0.15), 0 0 24px rgba(201,168,76,0.08)',
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// WheelDetail — luxury alloy wheel close-up with brake caliper
// ─────────────────────────────────────────────────────────────

export function WheelDetail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      <defs>
        <radialGradient id="wd-outer" cx="38%" cy="30%" r="60%">
          <stop offset="0%"   stopColor="#3A3228" stopOpacity="0.98"/>
          <stop offset="40%"  stopColor="#1A1610" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#080706" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id="wd-rim" cx="35%" cy="28%" r="55%">
          <stop offset="0%"   stopColor="#C8C8C8" stopOpacity="0.35"/>
          <stop offset="35%"  stopColor="#888880" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#888880" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="wd-caliper" cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0.2"/>
        </radialGradient>
        <radialGradient id="wd-hub" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#4A4030" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1A1610" stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* Outer tyre */}
      <circle cx="200" cy="200" r="188" fill="#0C0B09" />
      <circle cx="200" cy="200" r="188" stroke="#1E1C16" strokeWidth="2" fill="none" />
      {/* Tyre highlight */}
      <ellipse cx="148" cy="100" rx="52" ry="18" fill="#C8C8C8" opacity="0.06"
        transform="rotate(-30 148 100)" />

      {/* Alloy rim */}
      <circle cx="200" cy="200" r="158" fill="url(#wd-outer)" />
      <circle cx="200" cy="200" r="158" stroke="#3A3228" strokeWidth="1" fill="none" />

      {/* Rim surface gloss */}
      <circle cx="200" cy="200" r="158" fill="url(#wd-rim)" />

      {/* 5 spokes */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180
        const ox = 200 + 50 * Math.cos(rad)
        const oy = 200 + 50 * Math.sin(rad)
        const ix = 200 + 148 * Math.cos(rad)
        const iy = 200 + 148 * Math.sin(rad)
        // perpendicular offset for spoke width
        const pr = (angle - 90 + 90) * Math.PI / 180
        const w = 12
        return (
          <g key={i}>
            <polygon
              points={`
                ${ox + w*Math.cos(pr)},${oy + w*Math.sin(pr)}
                ${ox - w*Math.cos(pr)},${oy - w*Math.sin(pr)}
                ${ix - 6*Math.cos(pr)},${iy - 6*Math.sin(pr)}
                ${ix + 6*Math.cos(pr)},${iy + 6*Math.sin(pr)}
              `}
              fill="#2A2418"
              stroke="#3A3228"
              strokeWidth="0.5"
            />
            {/* Spoke highlight edge */}
            <line
              x1={ox + w*Math.cos(pr)} y1={oy + w*Math.sin(pr)}
              x2={ix + 6*Math.cos(pr)} y2={iy + 6*Math.sin(pr)}
              stroke="#C8C8C8"
              strokeWidth="0.6"
              opacity="0.15"
            />
          </g>
        )
      })}

      {/* Gold brake caliper — visible between spokes at angle 36° */}
      <path
        d="M 275 155 Q 295 180 292 210 Q 290 235 268 248 Q 252 256 238 248 Q 230 244 228 235 Q 240 238 250 232 Q 265 222 266 205 Q 267 185 255 168 Q 265 160 275 155Z"
        fill="url(#wd-caliper)"
        opacity="0.75"
      />
      <text x="254" y="210" fontFamily="DM Sans, sans-serif" fontSize="7"
        fill="#C9A84C" opacity="0.8" textAnchor="middle" letterSpacing="0.06em">
        DP
      </text>

      {/* Hub cap */}
      <circle cx="200" cy="200" r="42" fill="url(#wd-hub)" />
      <circle cx="200" cy="200" r="42" stroke="#3A3228" strokeWidth="1.5" fill="none" />
      <circle cx="200" cy="200" r="28" fill="#0F0E0B" stroke="#2A2418" strokeWidth="0.8" />
      {/* Hub bolts */}
      {[0,72,144,216,288].map((angle, i) => {
        const rad = (angle - 90) * Math.PI / 180
        return (
          <circle key={i}
            cx={200 + 20*Math.cos(rad)}
            cy={200 + 20*Math.sin(rad)}
            r="4"
            fill="#2A2418"
            stroke="#3A3228"
            strokeWidth="0.5"
          />
        )
      })}
      {/* Centre cap logo mark */}
      <circle cx="200" cy="200" r="10" fill="#C9A84C" opacity="0.5" />
      <circle cx="200" cy="200" r="6" fill="#8B6914" opacity="0.7" />

      {/* Rim specular highlight */}
      <ellipse cx="155" cy="128" rx="45" ry="18" fill="#FFFFFF" opacity="0.05"
        transform="rotate(-25 155 128)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// PaintClose — extreme close-up of corrected paint surface
// Perfect mirror finish with depth reflections
// ─────────────────────────────────────────────────────────────

export function PaintClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      <defs>
        <radialGradient id="pc-base" cx="55%" cy="35%" r="70%">
          <stop offset="0%"   stopColor="#1E1A10" stopOpacity="1"/>
          <stop offset="50%"  stopColor="#0F0D08" stopOpacity="1"/>
          <stop offset="100%" stopColor="#050503" stopOpacity="1"/>
        </radialGradient>
        <radialGradient id="pc-gloss" cx="45%" cy="25%" r="60%">
          <stop offset="0%"   stopColor="#E8C97A" stopOpacity="0.18"/>
          <stop offset="40%"  stopColor="#C9A84C" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pc-sky-reflect" cx="50%" cy="0%" r="70%">
          <stop offset="0%"   stopColor="#1A2030" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#0A0F18" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="pc-scan" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="white" stopOpacity="0"/>
          <stop offset="48%"  stopColor="white" stopOpacity="0.04"/>
          <stop offset="50%"  stopColor="white" stopOpacity="0.12"/>
          <stop offset="52%"  stopColor="white" stopOpacity="0.04"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Deep paint base */}
      <rect width="600" height="400" fill="url(#pc-base)" />

      {/* Sky reflection — paint is a mirror */}
      <rect width="600" height="400" fill="url(#pc-sky-reflect)" />

      {/* Gloss highlight — studio light */}
      <ellipse cx="280" cy="130" rx="220" ry="100"
        fill="url(#pc-gloss)" transform="rotate(-8 280 130)" />

      {/* Surface depth lines — shows the paint is perfectly flat */}
      {[0.5, 1.0, 1.5, 2.0, 2.5].map((opacity, i) => (
        <line key={i}
          x1="0" y1={80 + i * 60} x2="600" y2={80 + i * 60 - 20}
          stroke="rgba(255,255,255,0.015)"
          strokeWidth={opacity}
        />
      ))}

      {/* Inspection scan line */}
      <rect width="600" height="400" fill="url(#pc-scan)" />

      {/* Micro surface texture — barely perceptible */}
      <rect width="600" height="400"
        fill="none"
        style={{
          backgroundImage: 'repeating-linear-gradient(92deg, rgba(255,255,255,0.005) 0px, rgba(255,255,255,0.005) 1px, transparent 1px, transparent 8px)',
        }}
      />

      {/* Rim of a car — partially visible reflection */}
      <ellipse cx="300" cy="380" rx="500" ry="60"
        fill="#0D0B06"
        opacity="0.7" />
      <ellipse cx="300" cy="375" rx="380" ry="25"
        fill="none"
        stroke="#2A2218"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Gold depth shimmer — the flakes in the paint */}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i}
          cx={50 + (i * 47) % 560}
          cy={60 + (i * 31) % 320}
          r={0.8 + (i % 3) * 0.4}
          fill="#C9A84C"
          opacity={0.06 + (i % 4) * 0.02}
        />
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// ShowroomFloor — dark glossy floor with car reflection
// ─────────────────────────────────────────────────────────────

export function ShowroomFloor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sf-floor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#0F0E0B" stopOpacity="1"/>
          <stop offset="100%" stopColor="#050503" stopOpacity="1"/>
        </linearGradient>
        <radialGradient id="sf-light" cx="50%" cy="0%" r="60%">
          <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="sf-reflect" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#1A1610" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#1A1610" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect width="800" height="300" fill="url(#sf-floor)" />
      <rect width="800" height="300" fill="url(#sf-light)" />
      {/* Floor grid lines — showroom tiles */}
      {[100,200,300,400,500,600,700].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="rgba(255,255,255,0.018)" strokeWidth="0.5"/>
      ))}
      {[60,120,180,240].map(y => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.018)" strokeWidth="0.5"/>
      ))}
      {/* Car shadow/reflection */}
      <ellipse cx="400" cy="20" rx="280" ry="40" fill="url(#sf-reflect)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// CeramicCoatingVisual — layered coating protection diagram
// ─────────────────────────────────────────────────────────────

export function CeramicCoatingVisual({ className, hovered = false }: { className?: string; hovered?: boolean }) {
  return (
    <svg viewBox="0 0 500 350" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cc-clear" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#E8D9A0" stopOpacity={hovered ? 0.35 : 0.22}/>
          <stop offset="100%" stopColor="#C9A84C" stopOpacity={hovered ? 0.20 : 0.12}/>
        </linearGradient>
        <linearGradient id="cc-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#2A2218"/>
          <stop offset="100%" stopColor="#1A1510"/>
        </linearGradient>
        <linearGradient id="cc-primer" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#1A1610"/>
          <stop offset="100%" stopColor="#0F0D08"/>
        </linearGradient>
        <radialGradient id="cc-light" cx="30%" cy="0%" r="80%">
          <stop offset="0%"   stopColor="#E8C97A" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Steel substrate */}
      <rect x="40" y="260" width="420" height="50" fill="#141414" rx="2"/>
      <rect x="40" y="260" width="420" height="4" fill="#1E1E1E" rx="2"/>

      {/* Primer layer */}
      <rect x="40" y="220" width="420" height="42" fill="url(#cc-primer)" rx="1"/>
      <text x="52" y="246" fontFamily="DM Sans,sans-serif" fontSize="9"
        fill="#6B6B6B" letterSpacing="0.10em">PRIMER COAT</text>

      {/* Base colour layer */}
      <rect x="40" y="170" width="420" height="52" fill="url(#cc-base)" rx="1"/>
      <text x="52" y="198" fontFamily="DM Sans,sans-serif" fontSize="9"
        fill="#888780" letterSpacing="0.10em">BASE COLOUR</text>

      {/* Clear coat */}
      <rect x="40" y="125" width="420" height="47" fill="url(#cc-clear)" rx="2"/>
      <text x="52" y="150" fontFamily="DM Sans,sans-serif" fontSize="9"
        fill="#C9A84C" letterSpacing="0.10em">CLEAR COAT</text>

      {/* Ceramic SiO₂ layer */}
      <rect x="40" y="85" width="420" height="42" rx="2"
        fill={hovered ? 'rgba(201,168,76,0.18)' : 'rgba(201,168,76,0.10)'}
        style={{ transition: 'fill 0.5s' }}
      />
      <rect x="40" y="85" width="420" height="2" rx="1"
        fill="#C9A84C" opacity={hovered ? 0.7 : 0.4}/>
      <text x="52" y="110" fontFamily="DM Sans,sans-serif" fontSize="9"
        fill="#E8C97A" letterSpacing="0.10em">CERAMIC SiO₂ PROTECTION</text>

      {/* Water beading on top */}
      {[120,200,300,390].map((cx,i) => (
        <g key={i}>
          <ellipse cx={cx} cy="78" rx="10" ry="8" fill="rgba(180,200,240,0.5)" />
          <ellipse cx={cx-3} cy="74" rx="4" ry="3" fill="rgba(255,255,255,0.7)" />
        </g>
      ))}

      {/* Studio light reflection */}
      <rect x="40" y="85" width="420" height="90" fill="url(#cc-light)"/>

      {/* Depth measurement arrows */}
      <line x1="18" y1="85" x2="18" y2="312" stroke="#3A3A3A" strokeWidth="0.8"/>
      <text x="8" y="200" fontFamily="DM Sans,sans-serif" fontSize="8"
        fill="#3A3A3A" letterSpacing="0.05em"
        transform="rotate(-90 8 200)">DEPTH</text>
    </svg>
  )
}
