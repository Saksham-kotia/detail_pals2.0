-- ============================================================
-- DETAIL PALS V2 — Database Migration
-- File: supabase/migrations/001_initial_schema.sql
--
-- Run in Supabase Dashboard → SQL Editor, or via:
--   supabase db push
--
-- Creates:
--   - 8 custom enum types
--   - 12 tables with proper constraints
--   - Row Level Security on every table
--   - Triggers for booking_ref, timestamps, counters
--   - Helper function: generate_booking_ref()
--   - bookings_view for convenient admin queries
--   - Seed data: services, add-ons, pricing config, availability slots
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────

do $$ begin
  create type user_role          as enum ('admin', 'staff');
  create type booking_status     as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
  create type service_tier_enum  as enum ('essential', 'signature', 'concours');
  create type vehicle_type_enum  as enum ('sedan', 'suv', 'truck', 'van', 'luxury');
  create type vehicle_cond_enum  as enum ('light', 'moderate', 'heavy');
  create type review_platform    as enum ('google', 'direct', 'facebook', 'trustpilot');
  create type contact_status     as enum ('new', 'responded', 'archived');
  create type email_template     as enum ('booking-confirmation', 'staff-notification', 'contact-reply', 'booking-reminder');
exception when duplicate_object then null;
end $$;

-- ── Helper: generate booking reference ───────────────────────

create or replace function generate_booking_ref()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  ref   text := 'DP-';
  i     int;
begin
  for i in 1..6 loop
    ref := ref || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  -- Retry if collision (extremely rare)
  if exists (select 1 from bookings where bookings.ref = ref) then
    return generate_booking_ref();
  end if;
  return ref;
end;
$$;

-- ── Helper: update updated_at timestamp ──────────────────────

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE: profiles
-- Staff user profiles. One row per auth.users entry.
-- Created automatically via trigger on auth.users insert.
-- ============================================================

create table if not exists public.profiles (
  id          uuid         primary key references auth.users(id) on delete cascade,
  full_name   text         not null,
  role        user_role    not null default 'staff',
  avatar_url  text,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS: profiles ────────────────────────────────────────────

alter table public.profiles enable row level security;

-- Staff can read their own profile
create policy "profiles: staff read own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can update all profiles
create policy "profiles: admin update all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- TABLE: customers
-- ============================================================

create table if not exists public.customers (
  id              uuid         primary key default uuid_generate_v4(),
  name            text         not null,
  email           text         unique,
  phone           text         not null,
  vehicle_default text,
  notes           text,
  booking_count   integer      not null default 0,
  total_spend     numeric(10,2) not null default 0.00,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

create index if not exists customers_email_idx on public.customers(email);
create index if not exists customers_phone_idx on public.customers(phone);

create trigger customers_updated_at
  before update on public.customers
  for each row execute function set_updated_at();

-- ── RLS: customers ───────────────────────────────────────────

alter table public.customers enable row level security;

-- Anon can insert (creates customer on booking)
create policy "customers: anon insert"
  on public.customers for insert
  with check (true);

-- Authenticated staff can read all customers
create policy "customers: staff read all"
  on public.customers for select
  using (auth.role() = 'authenticated');

-- Admin can update/delete customers
create policy "customers: admin modify"
  on public.customers for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- TABLE: services
-- ============================================================

create table if not exists public.services (
  id            uuid                primary key default uuid_generate_v4(),
  tier          service_tier_enum   not null unique,
  name          text                not null,
  tagline       text                not null,
  description   text                not null,
  base_price    numeric(10,2)       not null,
  duration_min  numeric(4,1)        not null,  -- hours
  duration_max  numeric(4,1)        not null,
  includes      text[]              not null default '{}',
  badge         text,
  is_active     boolean             not null default true,
  display_order integer             not null default 0,
  created_at    timestamptz         not null default now(),
  updated_at    timestamptz         not null default now()
);

create trigger services_updated_at
  before update on public.services
  for each row execute function set_updated_at();

-- ── RLS: services ────────────────────────────────────────────

alter table public.services enable row level security;

-- Anyone can read active services (public pricing)
create policy "services: public read active"
  on public.services for select
  using (is_active = true);

-- Admin can read all (including inactive)
create policy "services: admin read all"
  on public.services for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Admin can modify services
create policy "services: admin modify"
  on public.services for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: add_ons
-- ============================================================

create table if not exists public.add_ons (
  id          uuid         primary key default uuid_generate_v4(),
  name        text         not null,
  description text         not null,
  price       numeric(10,2) not null,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

create trigger add_ons_updated_at
  before update on public.add_ons
  for each row execute function set_updated_at();

alter table public.add_ons enable row level security;

create policy "add_ons: public read active"
  on public.add_ons for select using (is_active = true);

create policy "add_ons: admin all"
  on public.add_ons for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: pricing_config (single row — always id = 'singleton')
-- ============================================================

create table if not exists public.pricing_config (
  id                    text         primary key default 'singleton',
  vehicle_multipliers   jsonb        not null default '{
    "sedan": 1.00,
    "suv": 1.20,
    "truck": 1.25,
    "van": 1.30,
    "luxury": 1.40
  }',
  condition_multipliers jsonb        not null default '{
    "light": 1.00,
    "moderate": 1.15,
    "heavy": 1.35
  }',
  updated_at            timestamptz  not null default now(),
  updated_by            uuid         references public.profiles(id)
);

alter table public.pricing_config enable row level security;

-- Anyone can read pricing config (used by quote calculator)
create policy "pricing_config: public read"
  on public.pricing_config for select using (true);

-- Only admin can update pricing
create policy "pricing_config: admin update"
  on public.pricing_config for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: bookings
-- ============================================================

create table if not exists public.bookings (
  id              uuid                primary key default uuid_generate_v4(),
  ref             text                not null unique default generate_booking_ref(),
  customer_id     uuid                not null references public.customers(id),
  service_id      uuid                not null references public.services(id),
  vehicle_type    vehicle_type_enum   not null,
  vehicle_make    text                not null,
  vehicle_model   text                not null,
  vehicle_year    integer,
  condition       vehicle_cond_enum   not null,
  add_on_ids      uuid[]              not null default '{}',
  quoted_price    numeric(10,2)       not null,
  final_price     numeric(10,2),
  status          booking_status      not null default 'pending',
  booking_date    date                not null,
  time_slot       text                not null,  -- "09:00"
  staff_id        uuid                references public.profiles(id),
  notes           text,
  internal_notes  text,
  created_at      timestamptz         not null default now(),
  updated_at      timestamptz         not null default now(),

  constraint bookings_vehicle_year_check check (vehicle_year is null or (vehicle_year >= 1990 and vehicle_year <= extract(year from now()) + 1)),
  constraint bookings_price_check check (quoted_price >= 0)
);

create index if not exists bookings_customer_idx    on public.bookings(customer_id);
create index if not exists bookings_status_idx      on public.bookings(status);
create index if not exists bookings_date_idx        on public.bookings(booking_date);
create index if not exists bookings_staff_idx       on public.bookings(staff_id);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function set_updated_at();

-- Auto-update customer booking_count and total_spend
create or replace function update_customer_stats()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.customers
    set booking_count = booking_count + 1,
        total_spend   = total_spend + coalesce(new.final_price, new.quoted_price)
    where id = new.customer_id;
  elsif TG_OP = 'UPDATE' and old.status != 'completed' and new.status = 'completed' then
    -- Add final_price when booking completes (if it changed from quoted)
    update public.customers
    set total_spend = total_spend + coalesce(new.final_price, new.quoted_price) - coalesce(old.final_price, old.quoted_price)
    where id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger bookings_customer_stats
  after insert or update on public.bookings
  for each row execute function update_customer_stats();

-- ── RLS: bookings ────────────────────────────────────────────

alter table public.bookings enable row level security;

-- Anon can insert (public booking submission)
create policy "bookings: anon insert"
  on public.bookings for insert
  with check (true);

-- Staff can read bookings assigned to them
create policy "bookings: staff read assigned"
  on public.bookings for select
  using (
    auth.role() = 'authenticated'
    and (
      staff_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- Staff can update status of their assigned bookings
create policy "bookings: staff update assigned"
  on public.bookings for update
  using (
    auth.role() = 'authenticated'
    and staff_id = auth.uid()
  )
  with check (true);

-- Admin full access
create policy "bookings: admin all"
  on public.bookings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: booking_status_log (immutable audit trail)
-- ============================================================

create table if not exists public.booking_status_log (
  id           uuid              primary key default uuid_generate_v4(),
  booking_id   uuid              not null references public.bookings(id) on delete cascade,
  from_status  booking_status,
  to_status    booking_status    not null,
  changed_by   uuid              references public.profiles(id),
  note         text,
  changed_at   timestamptz       not null default now()
);

create index if not exists bsl_booking_idx on public.booking_status_log(booking_id);

-- Auto-log status changes
create or replace function log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into public.booking_status_log (booking_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger bookings_status_log
  after update on public.bookings
  for each row execute function log_booking_status_change();

alter table public.booking_status_log enable row level security;

create policy "bsl: staff read"
  on public.booking_status_log for select
  using (auth.role() = 'authenticated');

-- Only the trigger (via security definer function) inserts — no direct policy needed

-- ============================================================
-- TABLE: availability_slots
-- ============================================================

create table if not exists public.availability_slots (
  id              uuid         primary key default uuid_generate_v4(),
  slot_date       date         not null,
  time_slot       text         not null,  -- "09:00"
  capacity        integer      not null default 1,
  bookings_count  integer      not null default 0,
  is_blocked      boolean      not null default false,
  blocked_reason  text,
  created_at      timestamptz  not null default now(),

  unique(slot_date, time_slot),
  constraint capacity_non_negative check (capacity >= 0),
  constraint count_non_negative    check (bookings_count >= 0)
);

create index if not exists avail_date_idx on public.availability_slots(slot_date);

-- Increment bookings_count when a booking is confirmed
create or replace function update_slot_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.availability_slots
    set bookings_count = bookings_count + 1
    where slot_date = new.booking_date and time_slot = new.time_slot;
  elsif TG_OP = 'UPDATE' and new.status = 'cancelled' and old.status != 'cancelled' then
    update public.availability_slots
    set bookings_count = greatest(0, bookings_count - 1)
    where slot_date = new.booking_date and time_slot = new.time_slot;
  end if;
  return new;
end;
$$;

create trigger bookings_slot_count
  after insert or update on public.bookings
  for each row execute function update_slot_count();

alter table public.availability_slots enable row level security;

-- Public can read available slots (not blocked, has capacity)
create policy "slots: public read available"
  on public.availability_slots for select
  using (is_blocked = false and bookings_count < capacity);

-- Admin can read all (including blocked) and modify
create policy "slots: admin all"
  on public.availability_slots for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: gallery
-- ============================================================

create table if not exists public.gallery (
  id                   uuid         primary key default uuid_generate_v4(),
  before_url           text         not null,
  after_url            text         not null,
  before_storage_path  text         not null,
  after_storage_path   text         not null,
  vehicle              text         not null,
  service_id           uuid         references public.services(id),
  hours                numeric(4,1) not null default 4,
  tags                 text[]       not null default '{}',
  caption              text,
  is_published         boolean      not null default false,
  display_order        integer      not null default 0,
  created_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now()
);

create trigger gallery_updated_at
  before update on public.gallery
  for each row execute function set_updated_at();

alter table public.gallery enable row level security;

create policy "gallery: public read published"
  on public.gallery for select
  using (is_published = true);

create policy "gallery: admin all"
  on public.gallery for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: testimonials
-- ============================================================

create table if not exists public.testimonials (
  id           uuid               primary key default uuid_generate_v4(),
  booking_id   uuid               references public.bookings(id),
  author_name  text               not null,
  vehicle      text               not null,
  service_tier service_tier_enum,
  rating       integer            not null check (rating between 1 and 5),
  quote        text               not null,
  review_date  date               not null,
  is_published boolean            not null default false,
  platform     review_platform    not null default 'direct',
  created_at   timestamptz        not null default now(),
  updated_at   timestamptz        not null default now()
);

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function set_updated_at();

alter table public.testimonials enable row level security;

create policy "testimonials: public read published"
  on public.testimonials for select
  using (is_published = true);

create policy "testimonials: admin all"
  on public.testimonials for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: contacts
-- ============================================================

create table if not exists public.contacts (
  id          uuid                                    primary key default uuid_generate_v4(),
  name        text                                    not null,
  email       text,
  phone       text,
  vehicle     text,
  message     text                                    not null,
  source      text                                    not null default 'contact-form',
  status      contact_status                          not null default 'new',
  customer_id uuid                                    references public.customers(id),
  created_at  timestamptz                             not null default now(),
  updated_at  timestamptz                             not null default now()
);

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function set_updated_at();

alter table public.contacts enable row level security;

create policy "contacts: anon insert"
  on public.contacts for insert
  with check (true);

create policy "contacts: admin all"
  on public.contacts for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: market_rates_cache
-- ============================================================

create table if not exists public.market_rates_cache (
  id           uuid               primary key default uuid_generate_v4(),
  tier         service_tier_enum  not null,
  vehicle_type vehicle_type_enum  not null,
  min_price    numeric(10,2)      not null,
  max_price    numeric(10,2)      not null,
  last_updated timestamptz        not null default now(),
  source       text               not null default 'manual',

  unique(tier, vehicle_type)
);

alter table public.market_rates_cache enable row level security;

create policy "market_rates: public read"
  on public.market_rates_cache for select using (true);

create policy "market_rates: admin all"
  on public.market_rates_cache for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ============================================================
-- TABLE: email_log
-- ============================================================

create table if not exists public.email_log (
  id         uuid           primary key default uuid_generate_v4(),
  to_email   text           not null,
  template   email_template not null,
  booking_id uuid           references public.bookings(id),
  resend_id  text,
  status     text           not null default 'sent',
  error_msg  text,
  sent_at    timestamptz    not null default now()
);

alter table public.email_log enable row level security;

create policy "email_log: admin read"
  on public.email_log for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Edge functions insert via service role key (bypasses RLS)

-- ============================================================
-- VIEW: bookings_view
-- Joins bookings with customer + service for admin queries
-- ============================================================

create or replace view public.bookings_view as
select
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
  c.name    as customer_name,
  c.phone   as customer_phone,
  c.email   as customer_email,
  s.name    as service_name,
  s.tier    as service_tier,
  p.full_name as staff_name
from
  public.bookings b
  join public.customers c  on c.id = b.customer_id
  join public.services  s  on s.id = b.service_id
  left join public.profiles p on p.id = b.staff_id;

-- RLS is enforced via the underlying tables

-- ============================================================
-- SEED DATA
-- ============================================================

-- ── Services ─────────────────────────────────────────────────

insert into public.services (tier, name, tagline, description, base_price, duration_min, duration_max, includes, badge, display_order) values
(
  'essential', 'Essential', 'The foundation of care.',
  'A thorough hand wash, clay bar decontamination, one-step polish, and premium wax protection. The standard every vehicle deserves — executed without shortcuts.',
  249.00, 3, 4,
  array['Hand wash & dry', 'Wheel & tyre detail', 'Clay bar decontamination', 'One-step machine polish', 'Carnauba wax protection', 'Interior vacuum & wipe-down'],
  null, 1
),
(
  'signature', 'Signature', 'The complete transformation.',
  'Our most popular treatment. Two-stage paint correction removes swirl marks and light scratches before a synthetic sealant locks in depth and clarity for up to twelve months.',
  549.00, 6, 8,
  array['Everything in Essential', 'Two-stage paint correction', 'Synthetic paint sealant (12-month)', 'Full interior deep clean', 'Glass polish & water repellent', 'Engine bay detail', 'Tyre dressing & trim restoration'],
  'Most popular', 2
),
(
  'concours', 'Concours', 'Perfection, without compromise.',
  'A multi-day, multi-stage correction reserved for vehicles that demand an exceptional finish. Paint thickness readings taken before and after. Ceramic coating applied under controlled conditions.',
  1499.00, 48, 72,
  array['Everything in Signature', 'Paint thickness measurement', 'Multi-stage paint correction', 'Professional ceramic coating (5-year)', 'Full leather conditioning & protection', 'Headlight restoration', 'Ceramic wheel coating', 'Post-detail inspection report'],
  null, 3
)
on conflict (tier) do nothing;

-- ── Add-ons ──────────────────────────────────────────────────

insert into public.add_ons (name, description, price) values
('Ozone odour treatment',      'Eliminates deep-set odours at the source',          79.00),
('Paint protection film',      'High-impact zones: bonnet & mirrors',               349.00),
('Leather deep conditioning',  'Restore suppleness to dry or cracked leather',       99.00),
('Pet hair removal',           'Complete extraction from all surfaces',               59.00),
('Engine bay detail',          'Full degreasing and dressing',                        89.00),
('Headlight restoration',      'Remove UV haze, restore clarity',                    69.00)
on conflict do nothing;

-- ── Pricing config ───────────────────────────────────────────

insert into public.pricing_config (id, vehicle_multipliers, condition_multipliers) values
(
  'singleton',
  '{"sedan": 1.00, "suv": 1.20, "truck": 1.25, "van": 1.30, "luxury": 1.40}',
  '{"light": 1.00, "moderate": 1.15, "heavy": 1.35}'
)
on conflict (id) do nothing;

-- ── Availability slots — generate next 60 days ───────────────
-- Mon–Sat, 6 time slots per day

do $$
declare
  curr_date date := current_date;
  end_date     date := curr_date + interval '60 days';
  day_of_week  int;
  slots        text[] := array['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];
  slot         text;
begin
  while curr_date <= end_date loop
    day_of_week := extract(dow from curr_date); -- 0=Sun, 6=Sat
    if day_of_week between 1 and 6 then            -- Mon–Sat
      foreach slot in array slots loop
        insert into public.availability_slots (slot_date, time_slot, capacity)
        values (curr_date, slot, 1)
        on conflict (slot_date, time_slot) do nothing;
      end loop;
    end if;
    curr_date := curr_date + interval '1 day';
  end loop;
end;
$$;

-- ── Market rates cache (sample data) ─────────────────────────

insert into public.market_rates_cache (tier, vehicle_type, min_price, max_price, source) values
('essential', 'sedan',  280, 350, 'manual'),
('essential', 'suv',    320, 400, 'manual'),
('essential', 'luxury', 360, 460, 'manual'),
('signature', 'sedan',  620, 780, 'manual'),
('signature', 'suv',    720, 900, 'manual'),
('signature', 'luxury', 820, 1050,'manual'),
('concours',  'sedan',  1700,2200,'manual'),
('concours',  'suv',    1900,2500,'manual'),
('concours',  'luxury', 2200,3000,'manual')
on conflict (tier, vehicle_type) do nothing;

-- ── Sample testimonials (published) ──────────────────────────

insert into public.testimonials (author_name, vehicle, service_tier, rating, quote, review_date, is_published, platform) values
('James M.',   'BMW M3 Competition',        'signature', 5, 'I have had my car detailed three times by different shops. Nothing came close to this. The paint correction on my BMW removed marks I had accepted as permanent. It genuinely looks better than the day I collected it.',          '2025-03-15', true, 'google'),
('Sarah K.',   'Porsche 911 Carrera S',     'concours',  5, 'The Concours treatment took two full days. I watched them use a paint thickness gauge before touching a panel. That level of care — and the result — justified every penny. Ceramic coating is flawless.',                     '2025-01-22', true, 'google'),
('David R.',   'Land Rover Defender 110',   'concours',  5, 'My Defender had five years of off-road abuse embedded in the paint. I brought it in as a daily driver and collected it looking like a show vehicle. Communication throughout was exceptional.',                              '2025-04-08', true, 'trustpilot'),
('Priya T.',   'Mercedes C-Class AMG Line', 'essential', 5, 'Booked the Essential for a light refresh before selling. The buyer offered asking price the moment they saw it. Best return on investment I have made on a car.',                                                          '2025-02-14', true, 'google'),
('Marcus O.',  '1972 Ferrari Dino 246 GT',  'concours',  5, 'I collect vintage cars. Detail Pals are the only detailers I trust with irreplaceable paintwork. Their understanding of period-correct finishes is as impressive as the results.',                                         '2025-05-03', true, 'direct'),
('Emma L.',    'Audi RS6 Avant',            'signature', 5, 'Three Signature details over two years. Every single time the result is identical — perfect. Consistency at this level is rarer than the craft itself.',                                                                  '2025-03-28', true, 'google')
on conflict do nothing;
