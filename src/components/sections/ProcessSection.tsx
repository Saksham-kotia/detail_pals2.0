/**
 * DETAIL PALS V2 — Process Section (Refactored Single-Row Layout)
 * ===============================================================
 * File: src/components/sections/ProcessSection.tsx
 *
 * Modified to support:
 * — Balanced 4-column card layout to replace bulky vertical rows
 * — Elegant hover highlights and technical stage detail footers
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'
import { clsx } from 'clsx'
import { springs, Section, SectionInner, Eyebrow, SectionHeadline } from '@/design-system'

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

const STAGE_IMAGES: Record<string, string> = {
  decontaminate: '/parts_decon.png',
  correct: '/parts_correct.png',
  protect: '/parts_protect.png',
  inspect: '/parts_inspect.png',
}

export function ProcessSection() {
  return (
    <LazyMotion features={domAnimation}>
      <Section id="process" className="bg-dp-bg border-t border-dp-border">
        <SectionInner>

          {/* Section Header */}
          <m.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={springs.responsive}
          >
            <Eyebrow className="mb-5">How we work</Eyebrow>
            <SectionHeadline className="max-w-[540px]">
              The craft behind <em>the result</em>
            </SectionHeadline>
            <p className="font-sans font-light text-sm text-dp-text-muted max-w-[480px] mt-4 leading-relaxed">
              Every vehicle follows the same four-stage methodology. The order is not arbitrary —
              it is the difference between a result that lasts and one that does not.
            </p>
          </m.div>

          {/* Process Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STAGES.map((stage, index) => (
              <m.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...springs.responsive, delay: index * 0.08 }}
                className="h-full"
              >
                <div className="border border-dp-border bg-dp-surface/40 hover:border-dp-gold transition-colors duration-500 p-6 flex flex-col h-full group relative overflow-hidden">
                  
                  {/* Subtle top gold accent line on card hover */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-dp-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-dp-out z-10" />

                  {/* Stage Image Header */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-dp-surface-deep mb-5 border border-dp-border/60 group-hover:border-dp-gold/30 transition-colors duration-500">
                    <img
                      src={STAGE_IMAGES[stage.id]}
                      alt={stage.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-dp-out group-hover:scale-105 opacity-80 group-hover:opacity-100 select-none pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dp-surface/50 via-transparent to-transparent" />
                  </div>

                  {/* Step metadata header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-sans font-normal text-xs text-dp-gold">{stage.number}</span>
                    <div className="w-3.5 h-px bg-dp-border" aria-hidden="true" />
                    <span className="font-sans font-normal text-[9px] tracking-wider uppercase text-dp-text-muted">
                      {stage.name}
                    </span>
                  </div>

                  {/* Step Headline */}
                  <h3 className="font-display font-light text-xl text-dp-text group-hover:text-dp-gold transition-colors duration-300 mb-3">
                    {stage.headline}
                  </h3>

                  {/* Step Description */}
                  <p className="font-sans font-light text-xs text-dp-text-muted leading-relaxed mb-5 flex-1">
                    {stage.body}
                  </p>

                  {/* Step details footer */}
                  <div className="border-t border-dp-border/40 pt-4 mt-auto flex items-start gap-2">
                    <span className="block w-2.5 h-px bg-dp-gold mt-[7px] flex-shrink-0" aria-hidden="true" />
                    <p className="font-sans font-light text-[10px] text-dp-text-muted leading-normal">
                      {stage.detail}
                    </p>
                  </div>

                </div>
              </m.div>
            ))}
          </div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}
