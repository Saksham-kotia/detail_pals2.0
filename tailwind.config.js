/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dp: {
          bg:            '#070707',
          surface:       '#0F0F0F',
          'surface-2':   '#181818',
          'surface-3':   '#222222',
          gold:          '#C9A84C',
          'gold-light':  '#E8C97A',
          text:          '#F0EDE6',
          'text-warm':   '#EDE8D8',
          'text-muted':  '#9CA3AF',
          'text-subtle': '#6B7280',
          amber:          '#D4841A',
          'amber-dim':    'rgba(212,132,26,0.15)',
          bronze:         '#8B6914',
          champagne:      '#F0E0B0',
          'champagne-dim':'rgba(240,224,176,0.08)',
          browser:        '#c8c8c8',
          chrome:         '#C8C8C8',
          'chrome-dim':   'rgba(200,200,200,0.08)',
          'surface-warm': 'rgba(20,16,8,0.95)',
          border:         'var(--dp-border)',
          'border-hover': 'var(--dp-border-hover)',
          'border-gold':  'var(--dp-border-gold)',
          'border-gold-dim': 'var(--dp-border-gold-dim)',
          'border-gold-active': 'var(--dp-border-gold-active)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"','Georgia','serif'],
        sans:    ['"DM Sans"','system-ui','sans-serif'],
      },
      fontSize: {
        hero:    ['clamp(52px,7.5vw,96px)',  {lineHeight:'1.0',letterSpacing:'-0.025em'}],
        section: ['clamp(36px,4.5vw,60px)',  {lineHeight:'1.1',letterSpacing:'-0.01em'}],
        xl:      ['clamp(20px,2.5vw,28px)',  {lineHeight:'1.2'}],
        sm:      ['15px',                    {lineHeight:'1.5'}],
        xs:      ['13px',                    {lineHeight:'1.4'}],
      },
      letterSpacing: {
        widest2: '0.22em',
        wide2:   '0.14em',
        nav:     '0.08em',
      },
      maxWidth: {
        site:   '1280px',
        text:   '640px',
        narrow: '480px',
      },
      height: { nav: '72px' },
      transitionTimingFunction: {
        'dp-out':    'cubic-bezier(0.16,1,0.3,1)',
        'dp-spring': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
      transitionDuration: {
        '400':'400ms','600':'600ms','800':'800ms','1100':'1100ms',
      },
      backgroundImage: {
        'gold-rule': 'linear-gradient(to right,#C9A84C,transparent 70%)',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(201,168,76,0.25),0 0 24px rgba(201,168,76,0.10)',
        'gold-md': '0 0 20px rgba(201,168,76,0.35),0 0 40px rgba(201,168,76,0.15)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.45),0 0 80px rgba(201,168,76,0.20)',
        'amber-md': '0 0 20px rgba(212,132,26,0.25),0 0 40px rgba(212,132,26,0.10)',
        'chrome-md': '0 0 16px rgba(200,200,200,0.15),0 0 32px rgba(200,200,200,0.06)',
      },
      keyframes: {
        'particle-drift': {
          '0%':   {transform:'translateY(0px) translateX(0px)', opacity:'0'},
          '10%':  {opacity:'1'},
          '90%':  {opacity:'0.6'},
          '100%': {transform:'translateY(-120vh) translateX(20px)', opacity:'0'},
        },
        'scan-line': {
          '0%,100%': {transform:'translateX(-100%)', opacity:'0'},
          '5%':      {opacity:'1'},
          '50%':     {transform:'translateX(100vw)', opacity:'0.6'},
          '51%':     {opacity:'0'},
        },
        'gold-pulse': {
          '0%,100%': {boxShadow:'0 0 20px rgba(201,168,76,0.35),0 0 40px rgba(201,168,76,0.15)'},
          '50%':     {boxShadow:'0 0 30px rgba(201,168,76,0.55),0 0 60px rgba(201,168,76,0.25)'},
        },
        'float-y': {
          '0%,100%': {transform:'translateY(0px)'},
          '50%':     {transform:'translateY(-8px)'},
        },
        'shimmer': {
          '0%':   {backgroundPosition:'200% center'},
          '100%': {backgroundPosition:'-200% center'},
        },
        'intro-line': {
          '0%':   {scaleX:'0', opacity:'0'},
          '30%':  {opacity:'1'},
          '100%': {scaleX:'1', opacity:'1'},
        },
        'intro-wordmark': {
          '0%':   {opacity:'0', letterSpacing:'-0.05em'},
          '100%': {opacity:'1', letterSpacing:'0.28em'},
        },
        'intro-rise': {
          '0%':   {opacity:'1', transform:'translateY(0)'},
          '100%': {opacity:'1', transform:'translateY(-100%)'},
        },
        'glow-breathe': {
          '0%,100%': {opacity:'0.6'},
          '50%':     {opacity:'1'},
        },
      },
      animation: {
        'scan-line':    'scan-line var(--dp-dur-scan,8s) ease-in-out infinite',
        'gold-pulse':   'gold-pulse 2s ease-in-out infinite',
        'float-y':      'float-y 4s ease-in-out infinite',
        'shimmer':      'shimmer 3s linear infinite',
        'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
