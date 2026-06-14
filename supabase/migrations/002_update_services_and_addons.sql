-- Drop view first
DROP VIEW IF EXISTS public.bookings_view;

-- Alter testimonials service_tier to text
ALTER TABLE public.testimonials ALTER COLUMN service_tier TYPE text USING service_tier::text;

-- Alter market_rates_cache tier to text
ALTER TABLE public.market_rates_cache DROP CONSTRAINT IF EXISTS market_rates_cache_tier_vehicle_type_key;
ALTER TABLE public.market_rates_cache ALTER COLUMN tier TYPE text USING tier::text;
ALTER TABLE public.market_rates_cache ADD CONSTRAINT market_rates_cache_tier_vehicle_type_key UNIQUE (tier, vehicle_type);

-- Alter services table: drop unique constraint on tier, alter type of tier to text
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_tier_key;
ALTER TABLE public.services ALTER COLUMN tier TYPE text USING tier::text;

-- Recreate view
CREATE OR REPLACE VIEW public.bookings_view AS
SELECT
  b.id,
  b.ref,
  b.status,
  b.booking_date,
  b.time_slot,
  b.quoted_price,
  b.final_price,
  b.vehicle_type,
  b.vehicle_make,
  b.vehicle_model,
  b.condition,
  b.add_on_ids,
  b.notes,
  b.created_at,
  c.name    AS customer_name,
  c.phone   AS customer_phone,
  c.email   AS customer_email,
  s.name    AS service_name,
  s.tier    AS service_tier,
  p.full_name AS staff_name
FROM
  public.bookings b
  JOIN public.customers c  ON c.id = b.customer_id
  JOIN public.services  s  ON s.id = b.service_id
  LEFT JOIN public.profiles p ON p.id = b.staff_id;

-- Delete existing seed data
DELETE FROM public.testimonials;
DELETE FROM public.bookings;
DELETE FROM public.services;
DELETE FROM public.add_ons;
DELETE FROM public.market_rates_cache;

-- Seed the 6 services
INSERT INTO public.services (id, tier, name, tagline, description, base_price, duration_min, duration_max, includes, badge, display_order) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'basic_wash',
  'Basic Wash & Vacuum',
  'Foundational shine, inside and out.',
  'Exterior hand wash, wheel cleaning, interior vacuum and window wipe-down. The perfect maintenance clean.',
  100.00,
  1.0,
  1.0,
  ARRAY['Hand wash & dry', 'Wheel & tyre detail', 'Interior vacuum', 'Window wipe-down', 'Dashboard dusting'],
  NULL,
  1
),
(
  '00000000-0000-0000-0000-000000000002',
  'interior_deep',
  'Interior Deep Clean',
  'Like-new interior cabin freshness.',
  'Full interior shampoo, steam cleaning, leather conditioning, vents, crevices and trim restoration.',
  149.00,
  3.0,
  3.0,
  ARRAY['Carpet & seat shampoo', 'Steam clean vents & gaps', 'Leather conditioning', 'Trim restoration', 'Fabric protection', 'Deodorizing treatment'],
  NULL,
  2
),
(
  '00000000-0000-0000-0000-000000000003',
  'exterior_polish',
  'Exterior Polish & Wax',
  'High-gloss paint revitalization.',
  'Machine polish to remove light swirls, followed by a premium carnauba wax for deep gloss and protection.',
  179.00,
  3.0,
  3.0,
  ARRAY['Decontamination prep wash', 'Clay bar paint decontamination', 'Single-stage machine polish', 'Premium carnauba wax', 'Tyre dressing & trim polish'],
  NULL,
  3
),
(
  '00000000-0000-0000-0000-000000000004',
  'full_detail',
  'Full Detail Package',
  'The complete vehicle reset.',
  'Our signature inside-and-out transformation: deep interior clean plus exterior polish, wax and dressing.',
  299.00,
  5.0,
  5.0,
  ARRAY['Everything in Basic Wash', 'Interior shampoo & steam clean', 'Clay paint decontamination', 'Single-stage polish & sealant', 'Engine bay detail', 'Exhaust tip polish & trim dressing'],
  'Most popular',
  4
),
(
  '00000000-0000-0000-0000-000000000005',
  'ceramic_coating',
  'Ceramic Coating',
  'Long-term glass-like armor.',
  'Professional-grade ceramic coating with multi-year protection, extreme hydrophobics and candy-gloss finish.',
  699.00,
  24.0,
  48.0,
  ARRAY['Prep decontamination wash', 'Paint thickness profiling', 'Single-stage correction pass', '9H Professional ceramic coat (3-year)', 'Wheel face ceramic coating', 'Glass hydrophobic treatment'],
  NULL,
  5
),
(
  '00000000-0000-0000-0000-000000000006',
  'paint_correction',
  'Paint Correction',
  'Perfect reflection, restored.',
  'Multi-stage machine correction removing swirls, scratches and oxidation to restore a mirror finish.',
  449.00,
  12.0,
  24.0,
  ARRAY['Detail paint depth profiling', 'Heavy compound cutting pass', 'Fine machine polishing pass', 'Paint sealant (12-month)', 'Trim & exterior chrome restoration'],
  NULL,
  6
);

-- Seed the 6 add-ons
INSERT INTO public.add_ons (id, name, description, price, is_active) VALUES
('00000000-0000-0000-0000-000000000101', 'Engine Bay Cleaning', 'Full degreasing and dressing', 59.00, true),
('00000000-0000-0000-0000-000000000102', 'Odor Elimination', 'Eliminates deep-set odours at the source', 79.00, true),
('00000000-0000-0000-0000-000000000103', 'Headlight Restoration', 'Remove UV haze, restore clarity', 69.00, true),
('00000000-0000-0000-0000-000000000104', 'Pet Hair Removal', 'Complete extraction from all surfaces', 49.00, true),
('00000000-0000-0000-0000-000000000105', 'Rim & Tire Detailing', 'Chemical iron wash + ceramic faces', 45.00, true),
('00000000-0000-0000-0000-000000000106', 'Glass & Rain Repellent', 'Hydrophobic coating on front/rear screens', 39.00, true);

-- Seed market rates cache for the 6 services (essential/signature/concours mapped or new ones)
INSERT INTO public.market_rates_cache (tier, vehicle_type, min_price, max_price, source) VALUES
('basic_wash',        'sedan',  80, 150, 'manual'),
('basic_wash',        'suv',   100, 180, 'manual'),
('basic_wash',        'luxury',120, 220, 'manual'),
('interior_deep',     'sedan', 120, 180, 'manual'),
('interior_deep',     'suv',   140, 210, 'manual'),
('interior_deep',     'luxury',160, 250, 'manual'),
('exterior_polish',   'sedan', 150, 220, 'manual'),
('exterior_polish',   'suv',   170, 260, 'manual'),
('exterior_polish',   'luxury',190, 300, 'manual'),
('full_detail',       'sedan', 250, 350, 'manual'),
('full_detail',       'suv',   290, 420, 'manual'),
('full_detail',       'luxury',340, 500, 'manual'),
('ceramic_coating',   'sedan', 600, 800, 'manual'),
('ceramic_coating',   'suv',   700, 950, 'manual'),
('ceramic_coating',   'luxury',800, 1200,'manual'),
('paint_correction',  'sedan', 400, 550, 'manual'),
('paint_correction',  'suv',   460, 650, 'manual'),
('paint_correction',  'luxury',520, 780, 'manual');

-- Seed sample testimonials using the new service tier/ID strings
INSERT INTO public.testimonials (author_name, vehicle, service_tier, rating, quote, review_date, is_published, platform) VALUES
('James M.',   'BMW M3 Competition',        'paint_correction', 5, 'I have had my car detailed three times by different shops. Nothing came close to this. The paint correction on my BMW removed marks I had accepted as permanent. It genuinely looks better than the day I collected it.',          '2025-03-15', true, 'google'),
('Sarah K.',   'Porsche 911 Carrera S',     'ceramic_coating',  5, 'The Ceramic Coating treatment took two full days. I watched them use a paint thickness gauge before touching a panel. That level of care — and the result — justified every penny. Ceramic coating is flawless.',                     '2025-01-22', true, 'google'),
('David R.',   'Land Rover Defender 110',   'paint_correction', 5, 'My Defender had five years of off-road abuse embedded in the paint. I brought it in as a daily driver and collected it looking like a show vehicle. Communication throughout was exceptional.',                              '2025-04-08', true, 'trustpilot'),
('Priya T.',   'Mercedes C-Class AMG Line', 'basic_wash',        5, 'Booked the Basic Wash for a light refresh before selling. The buyer offered asking price the moment they saw it. Best return on investment I have made on a car.',                                                          '2025-02-14', true, 'google'),
('Marcus O.',  '1972 Ferrari Dino 246 GT',  'paint_correction', 5, 'I collect vintage cars. Detail Pals are the only detailers I trust with irreplaceable paintwork. Their understanding of period-correct finishes is as impressive as the results.',                                         '2025-05-03', true, 'direct'),
('Emma L.',    'Audi RS6 Avant',            'ceramic_coating',  5, 'Three Ceramic Coatings over two years. Every single time the result is identical — perfect. Consistency at this level is rarer than the craft itself.',                                                                  '2025-03-28', true, 'google');
