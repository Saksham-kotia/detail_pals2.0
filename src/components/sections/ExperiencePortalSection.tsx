import { m, LazyMotion, domAnimation } from 'framer-motion'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Section,
  SectionInner,
  Eyebrow,
  SectionHeadline,
  springs,
  fadeUp,
  staggerContainer
} from '@/design-system'
import { TiltCard } from '@/components/ui/TiltCard'

const PORTALS = [
  {
    title: 'Showroom Gallery',
    desc: 'Browse cinematic paint corrections. Review slider transformations on legendary chassis.',
    path: '/gallery',
    colorClass: 'group-hover:border-[#00D2FF] group-hover:shadow-[0_0_24px_rgba(0,210,255,0.2)]',
    glowColor: 'rgba(0,210,255,0.06)',
    label: 'Explore Work',
    badge: 'Real Transformations'
  },
  {
    title: 'Detailing Services',
    desc: 'Six modular, paint-safe packages tailored to protect or correct your vehicle clear coat.',
    path: '/services',
    colorClass: 'group-hover:border-[#C9A84C] group-hover:shadow-[0_0_24px_rgba(201,168,76,0.2)]',
    glowColor: 'rgba(201,168,76,0.06)',
    label: 'View Packages',
    badge: 'Precision Tiers'
  },
  {
    title: 'Client Stories',
    desc: 'Read technical case reports and unfiltered feedback from luxury vehicle collectors.',
    path: '/reviews',
    colorClass: 'group-hover:border-[#F0E0B0] group-hover:shadow-[0_0_24px_rgba(240,224,176,0.2)]',
    glowColor: 'rgba(240,224,176,0.06)',
    label: 'Read Reviews',
    badge: '100% Satisfaction'
  },
  {
    title: 'Bespoke Configurator',
    desc: 'Build your custom service layer-by-layer and get transparent pricing instantly.',
    path: '/booking',
    colorClass: 'group-hover:border-[#FF2D55] group-hover:shadow-[0_0_24px_rgba(255,45,85,0.2)]',
    glowColor: 'rgba(255,45,85,0.06)',
    label: 'Configure Now',
    badge: 'Interactive Quote'
  },
  {
    title: 'Our Philosophy',
    desc: 'Learn about our paint thickness profiling methods, pH-safe chemistry, and team credentials.',
    path: '/about',
    colorClass: 'group-hover:border-white group-hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]',
    glowColor: 'rgba(255,255,255,0.04)',
    label: 'Our Story',
    badge: 'Eight Years of Craft'
  }
]

export function ExperiencePortalSection() {
  return (
    <LazyMotion features={domAnimation}>
      <Section id="portal-explore" className="bg-dp-bg border-b border-dp-border">
        {/* Decorative laser sweeps in background */}
        <div className="absolute top-[40%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#C9A84C]/[0.01] filter blur-[90px] pointer-events-none" />
        
        <SectionInner>
          <m.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mb-14 text-center"
          >
            <m.div variants={fadeUp} className="justify-center flex">
              <Eyebrow className="mb-5">Experience Portal</Eyebrow>
            </m.div>
            <m.div variants={fadeUp}>
              <SectionHeadline>
                Choose Your <em>Destination</em>
              </SectionHeadline>
            </m.div>
            <m.p variants={fadeUp} className="font-sans font-light text-base text-dp-text-muted max-w-[500px] mx-auto mt-4">
              Step into our specialized sections to explore our processes, package details, or schedule an inspection.
            </m.p>
          </m.div>

          <m.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer(0.06)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {PORTALS.map((portal) => (
              <m.div key={portal.title} variants={fadeUp} className="group">
                <Link to={portal.path} className="no-underline block h-full focus:outline-none">
                  <TiltCard 
                    maxTilt={6}
                    className={clsx(
                      'border border-dp-border p-8 h-full transition-all duration-500 relative flex flex-col justify-between bg-dp-surface/60 backdrop-blur-sm',
                      portal.colorClass
                    )}
                    data-cursor="hover"
                  >
                    {/* Glowing circular backdrop */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                      style={{
                        background: `radial-gradient(circle at 50% 10%, ${portal.glowColor} 0%, transparent 60%)`
                      }}
                    />

                    <div>
                      <div className="flex items-center justify-between gap-4 mb-8">
                        <span className="font-sans font-normal text-[8px] tracking-[0.18em] uppercase text-dp-gold">
                          {portal.badge}
                        </span>
                        <span className="text-dp-text-muted group-hover:text-dp-text transition-colors duration-300 text-xs">
                          →
                        </span>
                      </div>
                      
                      <h3 className="font-display font-light text-[24px] text-dp-text group-hover:text-dp-text-warm transition-colors duration-300 mb-4">
                        {portal.title}
                      </h3>
                      
                      <p className="font-sans font-light text-sm leading-[1.72] text-dp-text-muted mb-8 group-hover:text-dp-text-muted/80 transition-colors duration-300">
                        {portal.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-dp-border/60 flex items-center justify-between">
                      <span className="font-sans font-normal text-[10px] tracking-wider uppercase text-dp-text group-hover:text-dp-gold transition-colors duration-300">
                        {portal.label}
                      </span>
                    </div>

                  </TiltCard>
                </Link>
              </m.div>
            ))}
          </m.div>

        </SectionInner>
      </Section>
    </LazyMotion>
  )
}
