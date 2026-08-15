-- Flora boutique hotel: Supabase schema, RLS policies, and frontend seed data.
-- Ready to run as one script in the Supabase SQL Editor on a fresh project.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  eyebrow text not null,
  summary text not null,
  description text not null,
  size_label text not null,
  max_guests integer not null,
  bed text not null,
  view text not null,
  amenities text[] not null default '{}'::text[],
  image_urls text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  constraint room_types_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint room_types_max_guests_positive check (max_guests > 0),
  constraint room_types_has_amenities check (cardinality(amenities) > 0),
  constraint room_types_has_images check (cardinality(image_urls) > 0)
);

create table if not exists public.rate_plans (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  name text not null,
  price_per_night numeric(12, 2) not null,
  currency text not null default 'EUR',
  cancellation_policy text not null,
  booking_note text not null,
  created_at timestamptz not null default now(),
  constraint rate_plans_price_nonnegative check (price_per_night >= 0),
  constraint rate_plans_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint rate_plans_room_name_unique unique (room_type_id, name),
  constraint rate_plans_id_room_unique unique (id, room_type_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  room_type_id uuid not null references public.room_types(id) on delete restrict,
  rate_plan_id uuid not null references public.rate_plans(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  adults integer not null,
  children integer not null default 0,
  children_ages integer[] not null default '{}'::integer[],
  total_price numeric(12, 2) not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint bookings_guest_name_not_blank check (btrim(guest_name) <> ''),
  constraint bookings_guest_email_basic_format check (position('@' in guest_email) > 1),
  constraint bookings_guest_phone_not_blank check (btrim(guest_phone) <> ''),
  constraint bookings_valid_stay check (check_out > check_in),
  constraint bookings_adults_positive check (adults >= 1),
  constraint bookings_children_nonnegative check (children >= 0),
  constraint bookings_children_ages_match check (cardinality(children_ages) = children),
  constraint bookings_children_ages_valid check (
    children_ages <@ array[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  ),
  constraint bookings_total_price_nonnegative check (total_price >= 0),
  constraint bookings_status_valid check (status in ('pending', 'confirmed', 'cancelled')),
  constraint bookings_rate_matches_room foreign key (rate_plan_id, room_type_id)
    references public.rate_plans(id, room_type_id) on delete restrict
);

create index if not exists rate_plans_room_type_id_idx
  on public.rate_plans(room_type_id);

create index if not exists bookings_room_type_id_idx
  on public.bookings(room_type_id);

create index if not exists bookings_rate_plan_id_idx
  on public.bookings(rate_plan_id);

create index if not exists bookings_stay_dates_idx
  on public.bookings(check_in, check_out);

create index if not exists bookings_status_created_at_idx
  on public.bookings(status, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.room_types enable row level security;
alter table public.rate_plans enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Public can read room types" on public.room_types;
create policy "Public can read room types"
  on public.room_types
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read rate plans" on public.rate_plans;
create policy "Public can read rate plans"
  on public.rate_plans
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can create pending bookings" on public.bookings;
create policy "Public can create pending bookings"
  on public.bookings
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and exists (
      select 1
      from public.room_types as selected_room
      where selected_room.id = bookings.room_type_id
        and bookings.adults + bookings.children <= selected_room.max_guests
    )
  );

-- RLS blocks every operation without a matching policy. These grants make the
-- public API surface explicit as well: room/rate reads and booking creation only.
revoke all privileges on table public.room_types from anon, authenticated;
revoke all privileges on table public.rate_plans from anon, authenticated;
revoke all privileges on table public.bookings from anon, authenticated;

grant select on table public.room_types to anon, authenticated;
grant select on table public.rate_plans to anon, authenticated;
grant insert (
  guest_name,
  guest_email,
  guest_phone,
  room_type_id,
  rate_plan_id,
  check_in,
  check_out,
  adults,
  children,
  children_ages,
  total_price
) on table public.bookings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed data copied from data/hotel.ts
-- max_guests is derived from each implemented occupancy label.
-- ---------------------------------------------------------------------------

insert into public.room_types (
  name,
  slug,
  eyebrow,
  summary,
  description,
  size_label,
  max_guests,
  bed,
  view,
  amenities,
  image_urls
)
values
  (
    'Charming Room',
    'charming-room',
    'An intimate Florentine retreat',
    'Velvet tones, considered details and a serene king bed for slow mornings in the city.',
    'A softly layered room imagined for two, where contemporary comfort meets the collected character of a private palazzo. Photography, dimensions and exact in-room details are editorial placeholders pending the final property survey.',
    '28–32 m²',
    2,
    'King bed',
    'Palazzo courtyard',
    array[
      'Individually controlled climate',
      'Walk-in rainfall shower',
      'Italian linen and pillow menu',
      'Curated minibar and tea service',
      'High-speed Wi-Fi',
      'Evening turndown on request'
    ]::text[],
    array['/images/room-05.jpg', '/images/room-01.jpg', '/images/room-08.jpg', '/images/room-09.jpg']::text[]
  ),
  (
    'Heritage Suite',
    'heritage-suite',
    'A dialogue between past and present',
    'A generous sitting room, architectural proportions and tactile layers in deep blue and rose.',
    'The Heritage Suite is conceived as a private salon above Florence: generous in scale, quietly theatrical and composed around an unhurried sequence of sleeping and living spaces.',
    '46–52 m²',
    3,
    'King bed + daybed',
    'Historic rooftops',
    array[
      'Separate salon seating area',
      'King bed with Italian linen',
      'Double vanity bathroom',
      'Espresso and tea ritual',
      'Bluetooth speaker',
      'Unpacking service on request'
    ]::text[],
    array['/images/room-02.jpg', '/images/room-05.jpg', '/images/room-06.jpg', '/images/room-04.jpg']::text[]
  ),
  (
    'Majestic Suite',
    'majestic-suite',
    'A private palazzo in miniature',
    'Grand proportions, a salon for lingering and evening light across the rooftops.',
    'Flora’s most expansive suite is shaped as a sequence of private rooms, each with its own atmosphere. It is an editorial promise of scale and service; final specifications remain to be supplied by the hotel.',
    '68–76 m²',
    4,
    'King bed + salon sofa',
    'Duomo-facing, to confirm',
    array[
      'Private salon and dining table',
      'Dressing room',
      'Marble bathroom with soaking tub',
      'Dedicated host on request',
      'Premium minibar selection',
      'Arrival amenity'
    ]::text[],
    array['/images/room-06.jpg', '/images/room-05.jpg', '/images/room-09.jpg', '/images/room-02.jpg']::text[]
  ),
  (
    'Deluxe Double',
    'deluxe-double',
    'Light, calm and beautifully composed',
    'A luminous double room with a generous window, quiet materials and room to exhale.',
    'A fresh, light-filled interpretation of Florentine elegance. The room balances tailored utility with the soft finish of a private residence.',
    '34–38 m²',
    2,
    'King or twin beds',
    'City lane',
    array[
      'King or twin configuration',
      'Walk-in shower',
      'Reading chair and writing desk',
      'Italian bath amenities',
      'High-speed Wi-Fi',
      'In-room safe'
    ]::text[],
    array['/images/room-08.jpg', '/images/room-10.jpg', '/images/room-01.jpg', '/images/room-05.jpg']::text[]
  )
on conflict (slug) do update
set
  name = excluded.name,
  eyebrow = excluded.eyebrow,
  summary = excluded.summary,
  description = excluded.description,
  size_label = excluded.size_label,
  max_guests = excluded.max_guests,
  bed = excluded.bed,
  view = excluded.view,
  amenities = excluded.amenities,
  image_urls = excluded.image_urls;

-- These values intentionally mirror the frontend's currently implemented demo
-- prices and illustrative policies. Replace them before accepting real stays.
insert into public.rate_plans (
  room_type_id,
  name,
  price_per_night,
  currency,
  cancellation_policy,
  booking_note
)
select
  room.id,
  seed.name,
  seed.price_per_night,
  'EUR',
  seed.cancellation_policy,
  seed.booking_note
from (
  values
    (
      'charming-room',
      'Flora Flexible',
      420.00::numeric,
      'Illustrative policy: free cancellation until 3 days before arrival.',
      'Card guarantee required. Breakfast inclusion to be confirmed.'
    ),
    (
      'charming-room',
      'Quiet Escape',
      365.00::numeric,
      'Illustrative non-refundable rate.',
      'Full prepayment would be required in a live booking engine.'
    ),
    (
      'heritage-suite',
      'Heritage Flexible',
      610.00::numeric,
      'Illustrative policy: free cancellation until 5 days before arrival.',
      'Card guarantee required. Taxes are not calculated in this prototype.'
    ),
    (
      'heritage-suite',
      'Stay Awhile',
      545.00::numeric,
      'Illustrative non-refundable rate for two nights or more.',
      'Full prepayment would be required in a live booking engine.'
    ),
    (
      'majestic-suite',
      'Majestic Flexible',
      890.00::numeric,
      'Illustrative policy: free cancellation until 7 days before arrival.',
      'Card guarantee required. Live inventory is not connected.'
    ),
    (
      'majestic-suite',
      'Palazzo Advance',
      795.00::numeric,
      'Illustrative advance-purchase, non-refundable rate.',
      'Full prepayment would be required in a live booking engine.'
    ),
    (
      'deluxe-double',
      'Deluxe Flexible',
      485.00::numeric,
      'Illustrative policy: free cancellation until 3 days before arrival.',
      'Card guarantee required. Taxes are not calculated in this prototype.'
    ),
    (
      'deluxe-double',
      'Advance Florence',
      430.00::numeric,
      'Illustrative non-refundable rate.',
      'Full prepayment would be required in a live booking engine.'
    )
) as seed(room_slug, name, price_per_night, cancellation_policy, booking_note)
join public.room_types as room on room.slug = seed.room_slug
on conflict (room_type_id, name) do update
set
  price_per_night = excluded.price_per_night,
  currency = excluded.currency,
  cancellation_policy = excluded.cancellation_policy,
  booking_note = excluded.booking_note;

commit;
