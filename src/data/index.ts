/**
 * DETAIL PALS V2 — Site Data
 * ============================
 * All static content for the homepage.
 * In production this would be fetched from Supabase.
 * Separating data from components keeps sections clean.
 */

import type {
  Service, AddOn, GalleryItem, Testimonial, Stat
} from '@/types'

// ─── Services ────────────────────────────────────────────────

export const SERVICES: Service[] = [
  {
    id: 'basic_wash',
    name: 'Basic Wash & Vacuum',
    tagline: 'Foundational shine, inside and out.',
    description:
      'Exterior hand wash, wheel cleaning, interior vacuum and window wipe-down. The perfect maintenance clean.',
    duration: '1 hour',
    price: 100,
    includes: [
      'Hand wash & dry',
      'Wheel & tyre detail',
      'Interior vacuum',
      'Window wipe-down',
      'Dashboard dusting',
    ],
  },
  {
    id: 'interior_deep',
    name: 'Interior Deep Clean',
    tagline: 'Like-new interior cabin freshness.',
    description:
      'Full interior shampoo, steam cleaning, leather conditioning, vents, crevices and trim restoration.',
    duration: '3 hours',
    price: 149,
    includes: [
      'Carpet & seat shampoo',
      'Steam clean vents & gaps',
      'Leather conditioning',
      'Trim restoration',
      'Fabric protection',
      'Deodorizing treatment',
    ],
  },
  {
    id: 'exterior_polish',
    name: 'Exterior Polish & Wax',
    tagline: 'High-gloss paint revitalization.',
    description:
      'Machine polish to remove light swirls, followed by a premium carnauba wax for deep gloss and protection.',
    duration: '3 hours',
    price: 179,
    includes: [
      'Decontamination prep wash',
      'Clay bar paint decontamination',
      'Single-stage machine polish',
      'Premium carnauba wax',
      'Tyre dressing & trim polish',
    ],
  },
  {
    id: 'full_detail',
    name: 'Full Detail Package',
    tagline: 'The complete vehicle reset.',
    description:
      'Our signature inside-and-out transformation: deep interior clean plus exterior polish, wax and dressing.',
    duration: '5 hours',
    price: 299,
    badge: 'Most popular',
    includes: [
      'Everything in Basic Wash',
      'Interior shampoo & steam clean',
      'Clay paint decontamination',
      'Single-stage polish & sealant',
      'Engine bay detail',
      'Exhaust tip polish & trim dressing',
    ],
  },
  {
    id: 'ceramic_coating',
    name: 'Ceramic Coating',
    tagline: 'Long-term glass-like armor.',
    description:
      'Professional-grade ceramic coating with multi-year protection, extreme hydrophobics and candy-gloss finish.',
    duration: '1–2 days',
    price: 699,
    includes: [
      'Prep decontamination wash',
      'Paint thickness profiling',
      'Single-stage correction pass',
      '9H Professional ceramic coat (3-year)',
      'Wheel face ceramic coating',
      'Glass hydrophobic treatment',
    ],
  },
  {
    id: 'paint_correction',
    name: 'Paint Correction',
    tagline: 'Perfect reflection, restored.',
    description:
      'Multi-stage machine correction removing swirls, scratches and oxidation to restore a mirror finish.',
    duration: '1 day',
    price: 449,
    includes: [
      'Detail paint depth profiling',
      'Heavy compound cutting pass',
      'Fine machine polishing pass',
      'Paint sealant (12-month)',
      'Trim & exterior chrome restoration',
    ],
  },
]

export const ADD_ONS: AddOn[] = [
  { id: 'engine',      name: 'Engine Bay Cleaning',    description: 'Full degreasing and dressing',              price: 59  },
  { id: 'ozone',       name: 'Odor Elimination',       description: 'Eliminates deep-set odours at the source',  price: 79  },
  { id: 'headlight',   name: 'Headlight Restoration',   description: 'Remove UV haze, restore clarity',           price: 69  },
  { id: 'pet',         name: 'Pet Hair Removal',        description: 'Complete extraction from all surfaces',     price: 49  },
  { id: 'rim-tire',    name: 'Rim & Tire Detailing',    description: 'Chemical iron wash + ceramic faces',        price: 45  },
  { id: 'glass-rain',  name: 'Glass & Rain Repellent',  description: 'Hydrophobic coating on front/rear screens', price: 39  },
]

// ─── Vehicle multipliers (mirrors backend pricing engine) ────

export const VEHICLE_MULTIPLIERS = {
  sedan:  1.00,
  suv:    1.20,
  truck:  1.25,
  van:    1.30,
  luxury: 1.40,
} as const

export const CONDITION_MULTIPLIERS = {
  light:    1.00,
  moderate: 1.15,
  heavy:    1.35,
} as const

// ─── Gallery ─────────────────────────────────────────────────

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    beforeAlt: 'BMW 5 Series — swirled dark navy paint before detailing',
    afterAlt:  'BMW 5 Series — mirror-finish dark navy paint after Full Detail',
    service:   'Full Detail',
    vehicle:   'BMW 5 Series',
    hours:     7,
    tag:       ['sedan', 'correction'],
    sliderInit: 35,
  },
  {
    id: 'g2',
    beforeAlt: 'Porsche Cayenne SUV — oxidised silver paint before detailing',
    afterAlt:  'Porsche Cayenne SUV — deep glossy silver after Ceramic Coating',
    service:   'Ceramic Coating',
    vehicle:   'Porsche Cayenne',
    hours:     18,
    tag:       ['suv', 'ceramic', 'correction'],
    sliderInit: 40,
  },
  {
    id: 'g3',
    beforeAlt: 'Mercedes C-Class — water spots and light scratches before polish',
    afterAlt:  'Mercedes C-Class — brilliant white paint after Basic Wash',
    service:   'Basic Wash',
    vehicle:   'Mercedes C-Class',
    hours:     4,
    tag:       ['sedan'],
    sliderInit: 50,
  },
  {
    id: 'g4',
    beforeAlt: 'Land Rover Defender — heavily contaminated paint before correction',
    afterAlt:  'Land Rover Defender — deep ceramic-coated gloss after Paint Correction',
    service:   'Paint Correction + Coat',
    vehicle:   'Land Rover Defender',
    hours:     22,
    tag:       ['suv', 'ceramic'],
    sliderInit: 30,
  },
  {
    id: 'g5',
    beforeAlt: 'Audi RS6 — dull Nardo Grey before paint correction',
    afterAlt:  'Audi RS6 — velvety Nardo Grey after Paint Correction',
    service:   'Paint Correction',
    vehicle:   'Audi RS6',
    hours:     8,
    tag:       ['sedan', 'correction', 'luxury'],
    sliderInit: 45,
  },
  {
    id: 'g6',
    beforeAlt: 'Rolls-Royce Ghost — aged midnight black before restoration',
    afterAlt:  'Rolls-Royce Ghost — mirror-like midnight black after Ceramic Coating',
    service:   'Concours Ceramic',
    vehicle:   'Rolls-Royce Ghost',
    hours:     26,
    tag:       ['luxury', 'ceramic', 'correction'],
    sliderInit: 38,
  },
]

// ─── Testimonials ────────────────────────────────────────────

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote:
      "I have had my car detailed three times by different shops. Nothing came close to this. The paint correction on my BMW removed marks I had accepted as permanent. It genuinely looks better than the day I collected it.",
    author:  'James M.',
    vehicle: 'BMW M3 Competition',
    service: 'paint_correction',
    rating:  5,
    date:    'March 2025',
  },
  {
    id: 't2',
    quote:
      "The Ceramic Coating treatment took two full days. I watched them use a paint thickness gauge before touching a panel. That level of care — and the result — justified every penny. Ceramic coating is flawless.",
    author:  'Sarah K.',
    vehicle: 'Porsche 911 Carrera S',
    service: 'ceramic_coating',
    rating:  5,
    date:    'January 2025',
  },
  {
    id: 't3',
    quote:
      "My Defender had five years of off-road abuse embedded in the paint. I brought it in as a daily driver and collected it looking like a show vehicle. Communication throughout was exceptional.",
    author:  'David R.',
    vehicle: 'Land Rover Defender 110',
    service: 'paint_correction',
    rating:  5,
    date:    'April 2025',
  },
  {
    id: 't4',
    quote:
      "Booked the Basic Wash for a light refresh before selling. The buyer offered asking price the moment they saw it. Best return on investment I have made on a car.",
    author:  'Priya T.',
    vehicle: 'Mercedes C-Class AMG Line',
    service: 'basic_wash',
    rating:  5,
    date:    'February 2025',
  },
  {
    id: 't5',
    quote:
      "I collect vintage cars. Detail Pals are the only detailers I trust with irreplaceable paintwork. Their understanding of period-correct finishes is as impressive as the results.",
    author:  'Marcus O.',
    vehicle: '1972 Ferrari Dino 246 GT',
    service: 'paint_correction',
    rating:  5,
    date:    'May 2025',
  },
  {
    id: 't6',
    quote:
      "Three Ceramic Coatings over two years. Every single time the result is identical — perfect. Consistency at this level is rarer than the craft itself.",
    author:  'Emma L.',
    vehicle: 'Audi RS6 Avant',
    service: 'ceramic_coating',
    rating:  5,
    date:    'March 2025',
  },
]

// ─── Stats ───────────────────────────────────────────────────

export const STATS: Stat[] = [
  {
    value:  '200',
    suffix: '+',
    label:  'Vehicles transformed',
    detail: 'Every make, every model — treated with the same obsessive attention',
  },
  {
    value:  '4.9',
    suffix: '',
    label:  'Average rating',
    detail: 'Across Google, Trustpilot, and direct client reviews',
  },
  {
    value:  '8',
    suffix: ' yrs',
    label:  'In the craft',
    detail: 'Eight years of refinement — not volume',
  },
  {
    value:  '100',
    suffix: '%',
    label:  'Satisfaction rate',
    detail: 'Every vehicle leaves meeting our standard — or we return',
  },
]

