-- Flora admin RLS patch
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It adds SELECT and UPDATE (status only) privileges for authenticated users
-- so the admin dashboard can read bookings and confirm/cancel them.

begin;

-- ── SELECT: let authenticated users (admin) read all bookings ─────────────────
grant select on table public.bookings to authenticated;

drop policy if exists "Admin can read all bookings" on public.bookings;
create policy "Admin can read all bookings"
  on public.bookings
  for select
  to authenticated
  using (true);

-- ── UPDATE: let authenticated users update only the status column ─────────────
grant update (status) on table public.bookings to authenticated;

drop policy if exists "Admin can update booking status" on public.bookings;
create policy "Admin can update booking status"
  on public.bookings
  for update
  to authenticated
  using (true)
  with check (status in ('pending', 'confirmed', 'cancelled'));

commit;
