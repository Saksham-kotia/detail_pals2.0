/**
 * DETAIL PALS V2 — Process Section
 * =====================================
 * File: src/components/sections/ProcessSection.tsx
 *
 * Narrative position: between Gallery (proof) and Testimonials (trust).
 * Job: explain WHY professional detailing is worth the investment.
 * Answer: because of the craft and methodology behind the result.
 *
 * Layout: alternating left/right rows — each process stage occupies its own
 * full-width horizontal moment. The visual cadence prevents the
 * "long list of features" pattern that commoditises the service.
 *
 * The SVG illustrations simulate close-up process documentation photos.
 * In production: replace with real documentary photography.
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { staggerContainer, springs, Section, SectionInner, Eyebrow, SectionHeadline, GoldRule } from '@/design-system'

const PROCESS_STAGES = [
  {
    id: 'decontaminate',
    number: '01',
    name: 'Decontaminate',
    headline: 'Remove what washing cannot.',
    body: 'Iron fallout, industrial contamination, and road tar bond to paint at a molecular level. A chemical decontamination stage breaks these bonds before any abrasive work begins — protecting the paint from being compounded with embedded particles still present.',
    detail: 'pH-neutral snow foam · Iron fallout remover · Clay bar decontamination',
  },
  {
    id: 'correct',
    number: '02',
    name: 'Correct',
    headline: 'Restore depth and clarity.',
    body: 'Paint correction removes swirl marks, fine scratches, and water spot etching using controlled machine polishing. Paint thickness is measured before each pass. The goal is maximum defect removal with minimum material removal.',
    detail: 'Paint thickness measurement · Dual-action polisher · Rotary finishing',
  },
  {
    id: 'protect',
    number: '03',
    name: 'Protect',
    headline: 'Lock in the result.',
    body: 'Once the paint is corrected, a protection layer seals the surface and prevents new contamination bonding. Carnauba wax, synthetic sealant, or ceramic coating — each provides a different level of durability and depth of gloss.',
    detail: 'Carnauba wax · Synthetic sealant · Ceramic coating (SiO₂)',
  },
  {
    id: 'inspect',
    number: '04',
    name: 'Inspect',
    headline: 'Verify before handover.',
    body: 'Every vehicle is inspected under a high-intensity dual-beam light before handover. Any area that does not meet our standard is corrected. You receive the result we promised — not a compromise of it.',
    detail: 'Dual-beam inspection light · Before & after documentation · Client walkthrough',
  },
] as const

export function ProcessSection() {
  return (
    <LazyMotion features={domAnimation}>
      <Section id="process" className="bg-dp-bg">
        <SectionInner>

          {/* Header */}
          <m.div
            className="mb-16 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={springs.responsive}
          >
            <Eyebrow className="mb-5">How we work</Eyebrow>
            <SectionHeadline className="max-w-[540px]">
              The craft behind<br />
              <em>the result</em>
            </SectionHeadline>
            <p className="font-sans font-light text-base text-dp-text-muted max-w-[440px] mt-5 leading-[1.75]">
              Every vehicle follows the same four-stage methodology. The order is not arbitrary —
              it is the difference between a result that lasts and one that does not.
            </p>
          </m.div>

          {/* Process stages */}
          <div className="flex flex-col gap-px">
            {PROCESS_STAGES.map((stage, index) => (
              <ProcessStage key={stage.id} stage={stage} reversed={index % 2 === 1} />
            ))}
          </div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}

// ─────────────────────────────────────────────────────────────
// ProcessStage
// ─────────────────────────────────────────────────────────────

const STAGE_IMAGES: Record<string, string> = {
  decontaminate: '/parts_decon.png',
  correct: '/parts_correct.png',
  protect: '/parts_protect.png',
  inspect: '/parts_inspect.png',
}

function ProcessStage({
  stage, reversed,
}: {
  stage: typeof PROCESS_STAGES[number]
  reversed: boolean
}) {
  return (
    <m.div
      className={clsx(
        'grid grid-cols-1 lg:grid-cols-2 border border-dp-border group',
        'min-h-[280px]',
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={springs.responsive}
    >
      {/* Illustration close-up photo */}
      <div
        className={clsx(
          'relative flex items-center justify-center min-h-[200px] lg:min-h-0 bg-dp-surface-deep',
          'border-b lg:border-b-0',
          reversed
            ? 'lg:order-2 lg:border-l border-dp-border'
            : 'lg:order-1 lg:border-r border-dp-border',
          'overflow-hidden',
        )}
        aria-hidden="true"
      >
        <img
          src={STAGE_IMAGES[stage.id]}
          alt={stage.name}
          className="w-full h-full object-cover transition-transform duration-[800ms] ease-dp-out group-hover:scale-105 opacity-80 group-hover:opacity-100 select-none pointer-events-none"
        />
        {/* Soft shadow gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/60 via-transparent to-transparent" />
        
        {/* Stage number watermark */}
        <span
          className="absolute bottom-4 right-5 font-display font-light text-[80px] leading-none tracking-[-0.04em] pointer-events-none select-none z-10 transition-colors duration-500 group-hover:text-dp-gold/10"
          style={{ color: 'rgba(201,168,76,0.04)' }}
        >
          {stage.number}
        </span>
      </div>

      {/* Content */}
      <div
        className={clsx(
          'flex flex-col justify-center p-8 md:p-10 lg:p-12 bg-dp-surface/20 backdrop-blur-sm',
          reversed ? 'lg:order-1' : 'lg:order-2',
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="font-sans font-normal text-xs text-dp-gold">{stage.number}</span>
          <div className="w-4 h-px bg-dp-border" aria-hidden="true" />
          <span className="font-sans font-normal text-xs tracking-[0.12em] uppercase text-dp-text-muted">
            {stage.name}
          </span>
        </div>

        <h3 className="font-display font-light text-[clamp(24px,2.5vw,34px)] leading-snug tracking-[-0.01em] text-dp-text mb-4 transition-colors duration-300 group-hover:text-dp-gold">
          {stage.headline}
        </h3>

        <p className="font-sans font-light text-sm leading-[1.78] text-dp-text-muted max-w-[400px] mb-6">
          {stage.body}
        </p>

        <div className="flex items-start gap-2">
          <div className="w-3 h-px bg-dp-gold mt-[7px] flex-shrink-0" aria-hidden="true" />
          <p className="font-sans font-light text-xs text-dp-text-muted leading-[1.7]">
            {stage.detail}
          </p>
        </div>
      </div>
    </m.div>
  )
}
