-- Run this once in the Supabase SQL Editor after flora_schema.sql.
-- It lets the public booking UI check date overlap without exposing booking rows.

begin;

create or replace function public.check_room_availability(
  p_room_type_id uuid,
  p_check_in date,
  p_check_out date
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_check_out > p_check_in
    and exists (
      select 1
      from public.room_types as room
      where room.id = p_room_type_id
    )
    and not exists (
      select 1
      from public.bookings as booking
      where booking.room_type_id = p_room_type_id
        and booking.status in ('pending', 'confirmed')
        and booking.check_in < p_check_out
        and booking.check_out > p_check_in
    );
$$;

revoke all privileges on function public.check_room_availability(uuid, date, date) from public;
revoke all privileges on function public.check_room_availability(uuid, date, date) from anon, authenticated;
grant execute on function public.check_room_availability(uuid, date, date) to anon, authenticated;

commit;
