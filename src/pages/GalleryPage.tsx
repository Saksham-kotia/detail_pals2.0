import { useRef }             from 'react'
import { PageWrapper }       from '@/components/ui/PageWrapper'
import { Footer }            from '@/components/layout/Footer'
import { MobileStickyBar }   from '@/components/ui/MobileStickyBar'
import { GallerySection }    from '@/components/sections/GallerySection'
import { AtmosphericBackground } from '@/components/ui/AtmosphericBackground'
import { SplitTextReveal }   from '@/components/ui/SplitTextReveal'
import { Eyebrow }           from '@/design-system'
import { m, useScroll, useTransform } from 'framer-motion'
import { springs }           from '@/design-system'
import { CarSilhouette }     from '@/components/ui/AutomotiveSVGs'


export function GalleryPage() {
  const heroRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const carY  = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-8%'])

  return (
    <PageWrapper>
      {/* Page hero */}
      <section
        ref={heroRef}
        className="relative min-h-[55vh] flex items-end bg-dp-bg pt-[var(--dp-nav-h)] pb-20 px-[var(--dp-pad-x)] overflow-hidden"
      >
        <AtmosphericBackground variant="dark-fog" intensity={1.1} />

        {/* Car silhouette — atmospheric right element with parallax */}
        <m.div 
          className="absolute right-[-6%] bottom-0 w-[52%] max-w-[700px] opacity-20 pointer-events-none" 
          style={{ y: carY }}
          aria-hidden="true"
        >
          <CarSilhouette />
        </m.div>

        <m.div className="relative z-10 max-w-[var(--dp-max-w)] mx-auto w-full" style={{ y: textY }}>
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springs.responsive}>
            <Eyebrow className="mb-6">The proof</Eyebrow>
          </m.div>
          <SplitTextReveal text="Before. After." as="h1" onMount delay={0.1}
            className="font-display font-light text-section text-dp-text block mb-2" />
          <SplitTextReveal text="The difference." as="h1" onMount delay={0.25}
            className="font-display italic font-light text-section text-dp-text-warm block mb-8" />
          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="font-sans font-light text-base text-dp-text-muted max-w-[480px] leading-[1.78]">
            Drag each slider to reveal the transformation. Every result shown was
            produced by our team — no filters, no stock images.
          </m.p>
        </m.div>
      </section>

      <GallerySection />
      <Footer />
      <MobileStickyBar />
    </PageWrapper>
  )
}
