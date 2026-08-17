-- ============================================================================
-- Razorpay Deposit & Payment RLS Policy Patch
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

begin;

-- 1. Ensure columns exist on public.bookings
alter table public.bookings 
  add column if not exists deposit_amount numeric(12, 2),
  add column if not exists payment_status text default 'unpaid' check (payment_status in ('unpaid', 'awaiting_payment', 'deposit_paid')),
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;

-- 2. Grant column access to anon and authenticated roles
grant select on table public.bookings to anon, authenticated;
grant update (status, deposit_amount, payment_status, razorpay_order_id, razorpay_payment_id) on table public.bookings to anon, authenticated;

-- 3. Policy allowing guests to read their booking details on /pay/[bookingId]
drop policy if exists "Allow reading booking by id for payment" on public.bookings;
create policy "Allow reading booking by id for payment"
  on public.bookings
  for select
  to anon, authenticated
  using (true);

-- 4. Policy allowing payment status updates from verification and webhook
drop policy if exists "Allow updating booking payment details" on public.bookings;
create policy "Allow updating booking payment details"
  on public.bookings
  for update
  to anon, authenticated
  using (true)
  with check (true);

commit;
