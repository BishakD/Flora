-- ============================================================================
-- Security-Definer RPC functions for Flora Payment Flow
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

begin;

-- 1. get_booking_for_payment: Allows the public payment page to fetch specific
--    stay and pricing fields for a given booking ID without granting public SELECT
--    privileges on the entire bookings table.
create or replace function public.get_booking_for_payment(
  p_booking_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', b.id,
    'guest_name', b.guest_name,
    'guest_email', b.guest_email,
    'guest_phone', b.guest_phone,
    'check_in', b.check_in,
    'check_out', b.check_out,
    'adults', b.adults,
    'children', b.children,
    'total_price', b.total_price,
    'deposit_amount', b.deposit_amount,
    'payment_status', b.payment_status,
    'razorpay_order_id', b.razorpay_order_id,
    'razorpay_payment_id', b.razorpay_payment_id,
    'status', b.status,
    'room_types', jsonb_build_object(
      'name', r.name,
      'summary', r.summary,
      'image_urls', r.image_urls
    ),
    'rate_plans', jsonb_build_object(
      'name', rp.name,
      'currency', rp.currency
    )
  )
  from public.bookings as b
  join public.room_types as r on r.id = b.room_type_id
  join public.rate_plans as rp on rp.id = b.rate_plan_id
  where b.id = p_booking_id;
$$;

revoke all privileges on function public.get_booking_for_payment(uuid) from public;
revoke all privileges on function public.get_booking_for_payment(uuid) from anon, authenticated;
grant execute on function public.get_booking_for_payment(uuid) to anon, authenticated;

-- 2. record_deposit_paid: Allows payment verification and webhook routes to update
--    payment_status to 'deposit_paid' safely without exposing table-level update grants.
create or replace function public.record_deposit_paid(
  p_booking_id uuid,
  p_razorpay_payment_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking jsonb;
begin
  update public.bookings
  set
    payment_status = 'deposit_paid',
    razorpay_payment_id = coalesce(p_razorpay_payment_id, razorpay_payment_id)
  where id = p_booking_id;

  select jsonb_build_object(
    'id', b.id,
    'guest_name', b.guest_name,
    'guest_email', b.guest_email,
    'guest_phone', b.guest_phone,
    'check_in', b.check_in,
    'check_out', b.check_out,
    'adults', b.adults,
    'children', b.children,
    'total_price', b.total_price,
    'deposit_amount', b.deposit_amount,
    'payment_status', b.payment_status,
    'razorpay_order_id', b.razorpay_order_id,
    'razorpay_payment_id', b.razorpay_payment_id,
    'status', b.status,
    'room_types', jsonb_build_object(
      'name', r.name,
      'summary', r.summary,
      'image_urls', r.image_urls
    ),
    'rate_plans', jsonb_build_object(
      'name', rp.name,
      'currency', rp.currency
    )
  )
  into v_booking
  from public.bookings as b
  join public.room_types as r on r.id = b.room_type_id
  join public.rate_plans as rp on rp.id = b.rate_plan_id
  where b.id = p_booking_id;

  return v_booking;
end;
$$;

revoke all privileges on function public.record_deposit_paid(uuid, text) from public;
revoke all privileges on function public.record_deposit_paid(uuid, text) from anon, authenticated;
grant execute on function public.record_deposit_paid(uuid, text) to anon, authenticated;

commit;
