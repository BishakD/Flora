-- ============================================================================
-- 6-Character Booking Reference — Schema Patch
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)
-- ============================================================================

begin;

-- 1. Add booking_reference column
alter table public.bookings
  add column if not exists booking_reference text unique;

-- 2. Helper: generates a unique 6-char uppercase alphanumeric reference
--    Characters chosen to avoid visual ambiguity (no 0/O, no 1/I/L)
create or replace function public.generate_booking_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  chars  text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text;
  taken  bool;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select count(*) > 0 into taken
      from public.bookings
     where booking_reference = result;
    exit when not taken;
  end loop;
  return result;
end;
$$;

grant execute on function public.generate_booking_reference() to anon, authenticated;

-- 3. Backfill any existing bookings that have no reference yet
update public.bookings
   set booking_reference = public.generate_booking_reference()
 where booking_reference is null;

-- 4. Replace create_guest_booking to auto-generate the reference on every INSERT
create or replace function public.create_guest_booking(
  p_guest_name     text,
  p_guest_email    text,
  p_guest_phone    text,
  p_room_type_id   uuid,
  p_rate_plan_id   uuid,
  p_check_in       date,
  p_check_out      date,
  p_adults         int,
  p_children       int,
  p_children_ages  int[],
  p_total_price    numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id        uuid;
  v_deposit_amount    numeric;
  v_booking_reference text;
begin
  v_deposit_amount    := round(p_total_price * 0.25, 2);
  v_booking_reference := public.generate_booking_reference();

  insert into public.bookings (
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
    total_price,
    deposit_amount,
    status,
    payment_status,
    booking_reference
  ) values (
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_room_type_id,
    p_rate_plan_id,
    p_check_in,
    p_check_out,
    p_adults,
    p_children,
    p_children_ages,
    p_total_price,
    v_deposit_amount,
    'confirmed',
    'awaiting_payment',
    v_booking_reference
  )
  returning id into v_booking_id;

  return jsonb_build_object(
    'id',                v_booking_id,
    'deposit_amount',    v_deposit_amount,
    'booking_reference', v_booking_reference
  );
end;
$$;

-- Re-grant execute on the updated function
revoke all on function public.create_guest_booking from public;
grant  execute on function public.create_guest_booking to anon, authenticated;

commit;
