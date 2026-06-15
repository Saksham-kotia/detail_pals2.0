-- ============================================================
-- DETAIL PALS V2 â€” Database Migration
-- File: supabase/migrations/001_initial_schema.sql
--
-- Run in Supabase Dashboard â†’ SQL Editor, or via:
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

-- â”€â”€ Extensions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- â”€â”€ Enums â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ Helper: generate booking reference â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ Helper: update updated_at timestamp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ RLS: profiles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ RLS: customers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ RLS: services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
-- TABLE: pricing_config (single row â€” always id = 'singleton')
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

-- â”€â”€ RLS: bookings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- Only the trigger (via security definer function) inserts â€” no direct policy needed

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

-- â”€â”€ Services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

insert into public.services (tier, name, tagline, description, base_price, duration_min, duration_max, includes, badge, display_order) values
(
  'essential', 'Essential', 'The foundation of care.',
  'A thorough hand wash, clay bar decontamination, one-step polish, and premium wax protection. The standard every vehicle deserves â€” executed without shortcuts.',
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

-- â”€â”€ Add-ons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

insert into public.add_ons (name, description, price) values
('Ozone odour treatment',      'Eliminates deep-set odours at the source',          79.00),
('Paint protection film',      'High-impact zones: bonnet & mirrors',               349.00),
('Leather deep conditioning',  'Restore suppleness to dry or cracked leather',       99.00),
('Pet hair removal',           'Complete extraction from all surfaces',               59.00),
('Engine bay detail',          'Full degreasing and dressing',                        89.00),
('Headlight restoration',      'Remove UV haze, restore clarity',                    69.00)
on conflict do nothing;

-- â”€â”€ Pricing config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

insert into public.pricing_config (id, vehicle_multipliers, condition_multipliers) values
(
  'singleton',
  '{"sedan": 1.00, "suv": 1.20, "truck": 1.25, "van": 1.30, "luxury": 1.40}',
  '{"light": 1.00, "moderate": 1.15, "heavy": 1.35}'
)
on conflict (id) do nothing;

-- â”€â”€ Availability slots â€” generate next 60 days â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Monâ€“Sat, 6 time slots per day

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
    if day_of_week between 1 and 6 then            -- Monâ€“Sat
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

-- â”€â”€ Market rates cache (sample data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ Sample testimonials (published) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

insert into public.testimonials (author_name, vehicle, service_tier, rating, quote, review_date, is_published, platform) values
('James M.',   'BMW M3 Competition',        'signature', 5, 'I have had my car detailed three times by different shops. Nothing came close to this. The paint correction on my BMW removed marks I had accepted as permanent. It genuinely looks better than the day I collected it.',          '2025-03-15', true, 'google'),
('Sarah K.',   'Porsche 911 Carrera S',     'concours',  5, 'The Concours treatment took two full days. I watched them use a paint thickness gauge before touching a panel. That level of care â€” and the result â€” justified every penny. Ceramic coating is flawless.',                     '2025-01-22', true, 'google'),
('David R.',   'Land Rover Defender 110',   'concours',  5, 'My Defender had five years of off-road abuse embedded in the paint. I brought it in as a daily driver and collected it looking like a show vehicle. Communication throughout was exceptional.',                              '2025-04-08', true, 'trustpilot'),
('Priya T.',   'Mercedes C-Class AMG Line', 'essential', 5, 'Booked the Essential for a light refresh before selling. The buyer offered asking price the moment they saw it. Best return on investment I have made on a car.',                                                          '2025-02-14', true, 'google'),
('Marcus O.',  '1972 Ferrari Dino 246 GT',  'concours',  5, 'I collect vintage cars. Detail Pals are the only detailers I trust with irreplaceable paintwork. Their understanding of period-correct finishes is as impressive as the results.',                                         '2025-05-03', true, 'direct'),
('Emma L.',    'Audi RS6 Avant',            'signature', 5, 'Three Signature details over two years. Every single time the result is identical â€” perfect. Consistency at this level is rarer than the craft itself.',                                                                  '2025-03-28', true, 'google')
on conflict do nothing;
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
('Sarah K.',   'Porsche 911 Carrera S',     'ceramic_coating',  5, 'The Ceramic Coating treatment took two full days. I watched them use a paint thickness gauge before touching a panel. That level of care â€” and the result â€” justified every penny. Ceramic coating is flawless.',                     '2025-01-22', true, 'google'),
('David R.',   'Land Rover Defender 110',   'paint_correction', 5, 'My Defender had five years of off-road abuse embedded in the paint. I brought it in as a daily driver and collected it looking like a show vehicle. Communication throughout was exceptional.',                              '2025-04-08', true, 'trustpilot'),
('Priya T.',   'Mercedes C-Class AMG Line', 'basic_wash',        5, 'Booked the Basic Wash for a light refresh before selling. The buyer offered asking price the moment they saw it. Best return on investment I have made on a car.',                                                          '2025-02-14', true, 'google'),
('Marcus O.',  '1972 Ferrari Dino 246 GT',  'paint_correction', 5, 'I collect vintage cars. Detail Pals are the only detailers I trust with irreplaceable paintwork. Their understanding of period-correct finishes is as impressive as the results.',                                         '2025-05-03', true, 'direct'),
('Emma L.',    'Audi RS6 Avant',            'ceramic_coating',  5, 'Three Ceramic Coatings over two years. Every single time the result is identical â€” perfect. Consistency at this level is rarer than the craft itself.',                                                                  '2025-03-28', true, 'google');
-- Create gallery_images table using gen_random_uuid()
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  url          text         NOT null,
  storage_path text         NOT null,
  tag          text         NOT null CHECK (tag IN ('before', 'after')),
  pair_id      uuid,
  service_type text,
  caption      text,
  uploaded_at  timestamptz  NOT null DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "gallery_images: public read"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "gallery_images: admin all"
  ON public.gallery_images FOR ALL
  USING (exists (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));
-- Update handle_new_user function to default to 'admin' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Public Booking Tracking & Realtime
-- File: supabase/migrations/005_anon_tracking_policy.sql
-- ============================================================

-- 1. Allow public select on bookings (necessary for tracking by reference code)
CREATE POLICY "bookings: public select" ON public.bookings
  FOR SELECT USING (true);

-- 2. Allow public select on customers ONLY if they are linked to a booking
CREATE POLICY "customers: public select by booking reference" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.customer_id = customers.id
    )
  );

-- 3. Enable Realtime replication on the bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Fix RLS Infinite Recursion Loop
-- File: supabase/migrations/006_fix_rls_recursion.sql
-- ============================================================

-- 1. Create a security definer helper to check admin role
-- Since it is SECURITY DEFINER, it bypasses RLS on the profiles table, preventing loop errors.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Drop the recursive select and update policies on profiles
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin update all" ON public.profiles;

-- 3. Re-create profiles policies using the non-recursive function
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles: admin update all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 4. Drop and re-create bookings policy using the function
DROP POLICY IF EXISTS "bookings: admin all" ON public.bookings;
CREATE POLICY "bookings: admin all"
  ON public.bookings FOR ALL
  USING (public.is_admin());

-- 5. Drop and re-create customers policy using the function
DROP POLICY IF EXISTS "customers: admin modify" ON public.customers;
CREATE POLICY "customers: admin modify"
  ON public.customers FOR UPDATE
  USING (public.is_admin());
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Fix status log trigger RLS violation
-- File: supabase/migrations/007_fix_status_log_trigger.sql
-- ============================================================

-- Re-create the trigger function with SECURITY DEFINER privileges.
-- This allows the trigger to execute with the bypass privileges of the database owner,
-- allowing writes to the RLS-protected booking_status_log table.
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF old.status IS DISTINCT FROM new.status THEN
    INSERT INTO public.booking_status_log (booking_id, from_status, to_status, changed_by)
    VALUES (new.id, old.status, new.status, auth.uid());
  END IF;
  RETURN new;
END;
$$;
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Add booking customer fields
-- File: supabase/migrations/008_add_booking_customer_fields.sql
-- ============================================================

-- 1. Add columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_email text;

-- 2. Populate columns for existing bookings from the customers table
UPDATE public.bookings b
SET customer_name = c.name,
    customer_phone = c.phone,
    customer_email = c.email
FROM public.customers c
WHERE b.customer_id = c.id;

-- 3. Make the columns NOT NULL
ALTER TABLE public.bookings ALTER COLUMN customer_name SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN customer_phone SET NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN customer_email SET NOT NULL;

-- 4. Recreate the bookings_view to read directly from bookings table
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
  b.customer_name,
  b.customer_phone,
  b.customer_email,
  s.name    AS service_name,
  s.tier    AS service_tier,
  p.full_name AS staff_name
FROM
  public.bookings b
  JOIN public.services  s  ON s.id = b.service_id
  LEFT JOIN public.profiles p ON p.id = b.staff_id;
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Prevent Double Bookings
-- File: supabase/migrations/009_prevent_double_bookings.sql
-- ============================================================

-- Create a unique index on (booking_date, time_slot) where the booking status is active (not cancelled/rejected).
-- In the application:
--   'cancelled' maps to database status 'cancelled'
-- This index enforces database-level race condition protection.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_time_slot_idx
ON public.bookings (booking_date, time_slot)
WHERE (status != 'cancelled');
-- Create gallery storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Set up row-level security policies on storage objects
-- Allow public read access to the gallery bucket
CREATE POLICY "Allow public select on gallery bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow authenticated admin to insert files into the gallery bucket
CREATE POLICY "Allow admins to insert into gallery bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

-- Allow authenticated admin to update files in the gallery bucket
CREATE POLICY "Allow admins to update in gallery bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

-- Allow authenticated admin to delete files from the gallery bucket
CREATE POLICY "Allow admins to delete from gallery bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);
-- ============================================================
-- DETAIL PALS V2 â€” Migration: Secure Booking Access via RPC
-- File: supabase/migrations/011_secure_booking_access.sql
-- ============================================================

-- 1. Drop public select policies that leak PII / allow full scans
DROP POLICY IF EXISTS "bookings: public select" ON public.bookings;
DROP POLICY IF EXISTS "customers: public select by booking reference" ON public.customers;

-- 2. Ensure customers select policy only permits auth staff or owner definer queries
-- Customers can still be inserted by anon (booking creation)
-- Staff read is already handled by "customers: staff read all"

-- 3. Create SECURE RPC: get_booking_by_ref
CREATE OR REPLACE FUNCTION public.get_booking_by_ref(booking_ref text)
RETURNS TABLE (
  id uuid,
  ref text,
  customer_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  condition text,
  notes text,
  quoted_price numeric,
  status text,
  booking_date date,
  time_slot text,
  created_at timestamptz,
  updated_at timestamptz,
  service_id uuid,
  service_name text,
  service_tier text,
  service_price numeric,
  add_on_ids uuid[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.ref,
    b.customer_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.vehicle_type,
    b.vehicle_make,
    b.vehicle_model,
    b.vehicle_year::integer,
    b.vehicle_color,
    b.condition::text,
    b.notes,
    b.quoted_price,
    b.status::text,
    b.booking_date,
    b.time_slot,
    b.created_at,
    b.updated_at,
    b.service_id,
    s.name AS service_name,
    s.tier::text AS service_tier,
    s.base_price AS service_price,
    b.add_on_ids
  FROM public.bookings b
  JOIN public.customers c ON c.id = b.customer_id
  JOIN public.services s ON s.id = b.service_id
  WHERE b.ref = booking_ref;
END;
$$;

-- 4. Create SECURE RPC: get_occupied_slots
CREATE OR REPLACE FUNCTION public.get_occupied_slots()
RETURNS TABLE (
  booking_date date,
  time_slot text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT b.booking_date, b.time_slot
  FROM public.bookings b
  WHERE b.status != 'cancelled';
END;
$$;

-- 5. Create SECURE RPC: check_slot_available
CREATE OR REPLACE FUNCTION public.check_slot_available(check_date date, check_slot text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.booking_date = check_date
      AND b.time_slot = check_slot
      AND b.status != 'cancelled'
  );
END;
$$;
