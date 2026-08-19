-- ============================================================
-- Flora - Staff Table + Non-Recursive RLS
-- Run this in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Create the staff table (if not already created)
CREATE TABLE IF NOT EXISTS public.staff (
  id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('admin', 'reception')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Enable Row-Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 3. Helper function: SECURITY DEFINER avoids infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Drop any previous policies
DROP POLICY IF EXISTS "Admins can read staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can insert staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can update staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can delete staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can read own row" ON public.staff;
DROP POLICY IF EXISTS "Staff and admins read policy" ON public.staff;
DROP POLICY IF EXISTS "Admin write policy" ON public.staff;

-- 5. Non-recursive Select Policy:
CREATE POLICY "Staff and admins read policy"
  ON public.staff
  FOR SELECT
  USING (
    id = auth.uid() OR public.is_admin()
  );

-- 6. Non-recursive Modify Policy:
CREATE POLICY "Admin write policy"
  ON public.staff
  FOR ALL
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- 7. Automatically insert your admin account from auth.users (no manual UUID copy-pasting needed):
INSERT INTO public.staff (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE lower(email) = 'bishakdebb@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
