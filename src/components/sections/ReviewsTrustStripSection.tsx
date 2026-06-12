import { m, LazyMotion, domAnimation } from 'framer-motion'
import { SectionInner, springs } from '@/design-system'

export function ReviewsTrustStripSection() {
  const handleScrollToReviews = () => {
    // @ts-ignore
    window.lenis?.scrollTo('#reviews', { offset: -80 })
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="bg-dp-bg py-8 border-t border-b border-dp-border/40 relative overflow-hidden">
        {/* Soft inspection light background sweep */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          background: 'linear-gradient(90deg, transparent, var(--dp-gold) 50%, transparent)',
        }} />
        
        <SectionInner className="py-0">
          <m.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springs.responsive}
          >
            {/* Google Rating Badge */}
            <button 
              onClick={handleScrollToReviews}
              className="flex items-center text-left gap-4 group cursor-pointer no-underline focus:outline-none bg-transparent border-none p-0"
              data-cursor="hover"
            >
              <div className="w-10 h-10 rounded-full border border-dp-border group-hover:border-dp-gold transition-colors duration-300 flex items-center justify-center bg-dp-surface">
                <span className="font-display font-light text-base text-dp-gold">G</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-sans font-normal text-sm text-dp-text">Google Reviews</span>
                  <span className="text-dp-gold text-xs">★★★★★</span>
                </div>
                <p className="font-sans font-light text-xs text-dp-text-muted">
                  <strong className="text-dp-text font-normal">5.0 / 5.0</strong> rating based on 124 clients
                </p>
              </div>
            </button>

            {/* divider on desktop */}
            <div className="hidden md:block w-px h-8 bg-dp-border" aria-hidden="true" />

            {/* Facebook / Trustpilot Rating Badge */}
            <button 
              onClick={handleScrollToReviews}
              className="flex items-center text-left gap-4 group cursor-pointer no-underline focus:outline-none bg-transparent border-none p-0"
              data-cursor="hover"
            >
              <div className="w-10 h-10 rounded-full border border-dp-border group-hover:border-dp-gold transition-colors duration-300 flex items-center justify-center bg-dp-surface">
                <span className="font-display font-light text-base text-dp-gold">F</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-sans font-normal text-sm text-dp-text">Facebook Recommendation</span>
                  <span className="text-dp-gold text-xs">★★★★★</span>
                </div>
                <p className="font-sans font-light text-xs text-dp-text-muted">
                  <strong className="text-dp-text font-normal">4.9 / 5.0</strong> rating from 86 collectors
                </p>
              </div>
            </button>

            {/* divider on desktop */}
            <div className="hidden md:block w-px h-8 bg-dp-border" aria-hidden="true" />

            {/* Master Detailer Certification Badge */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-dp-border flex items-center justify-center bg-dp-surface">
                <svg className="w-5 h-5 text-dp-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-sans font-normal text-sm text-dp-text">IDA Certified</span>
                </div>
                <p className="font-sans font-light text-xs text-dp-text-muted">
                  International Detailing Association accredited shop
                </p>
              </div>
            </div>

            {/* divider on desktop */}
            <div className="hidden lg:block w-px h-8 bg-dp-border" aria-hidden="true" />

            {/* Read Reviews Link */}
            <button 
              onClick={handleScrollToReviews}
              className="font-sans font-normal text-xs tracking-wider uppercase text-dp-gold hover:text-dp-gold-light group flex items-center gap-2 transition-colors duration-300 no-underline bg-transparent border-none p-0 cursor-pointer"
              data-cursor="hover"
            >
              Read Client Stories
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>

          </m.div>
        </SectionInner>
      </section>
    </LazyMotion>
  )
}
