-- ============================================================================
-- Add 'refunded' and 'refund_failed' to the payment_status check constraint
-- on the bookings table.
--
-- Run this in Supabase SQL Editor → New query → Run
-- ============================================================================

begin;

-- 1. Drop the existing check constraint (name may vary — find it first)
--    If no constraint exists on payment_status, this block is a no-op.
do $$
declare
  v_constraint_name text;
begin
  select conname into v_constraint_name
  from pg_constraint
  where conrelid = 'public.bookings'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%payment_status%';

  if v_constraint_name is not null then
    execute 'alter table public.bookings drop constraint ' || quote_ident(v_constraint_name);
    raise notice 'Dropped constraint: %', v_constraint_name;
  else
    raise notice 'No payment_status check constraint found — nothing to drop.';
  end if;
end;
$$;

-- 2. Add new constraint with all five valid values
alter table public.bookings
  add constraint bookings_payment_status_check
  check (
    payment_status is null
    or payment_status in ('unpaid', 'awaiting_payment', 'deposit_paid', 'refunded', 'refund_failed')
  );

commit;
