-- ============================================================================
-- Direct Guest Checkout RLS & RPC Patch for Flora
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)
-- ============================================================================

begin;

-- 1. Grant SELECT and full column INSERT on bookings table to anon & authenticated
grant select, insert on table public.bookings to anon, authenticated;
grant update (status, deposit_amount, payment_status, razorpay_order_id, razorpay_payment_id) 
  on table public.bookings to anon, authenticated;

-- 2. Ensure RLS policies exist for guest checkout
drop policy if exists "Allow public to insert bookings" on public.bookings;
create policy "Allow public to insert bookings"
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public to read booking for checkout" on public.bookings;
create policy "Allow public to read booking for checkout"
  on public.bookings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public to update booking payment details" on public.bookings;
create policy "Allow public to update booking payment details"
  on public.bookings
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 3. Dedicated Security-Definer function to create guest bookings atomically
create or replace function public.create_guest_booking(
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_room_type_id uuid,
  p_rate_plan_id uuid,
  p_check_in date,
  p_check_out date,
  p_adults int,
  p_children int,
  p_children_ages int[],
  p_total_price numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid;
  v_deposit_amount numeric;
begin
  v_deposit_amount := round(p_total_price * 0.25, 2);

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
    payment_status
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
    'awaiting_payment'
  )
  returning id into v_booking_id;

  return jsonb_build_object(
    'id', v_booking_id,
    'deposit_amount', v_deposit_amount
  );
end;
$$;

revoke all privileges on function public.create_guest_booking from public;
revoke all privileges on function public.create_guest_booking from anon, authenticated;
grant execute on function public.create_guest_booking to anon, authenticated;

commit;
