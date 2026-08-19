-- ============================================================
-- Flora - Staff Table + RLS
-- Run this in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Create the staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('admin', 'reception')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Enable Row-Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 3. RLS: only admins can read staff table
CREATE POLICY "Admins can read staff"
  ON public.staff
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid()
        AND s.role = 'admin'
    )
  );

-- 4. RLS: only admins can insert
CREATE POLICY "Admins can insert staff"
  ON public.staff
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid()
        AND s.role = 'admin'
    )
  );

-- 5. RLS: only admins can update
CREATE POLICY "Admins can update staff"
  ON public.staff
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid()
        AND s.role = 'admin'
    )
  );

-- 6. RLS: only admins can delete
CREATE POLICY "Admins can delete staff"
  ON public.staff
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = auth.uid()
        AND s.role = 'admin'
    )
  );

-- 7. Allow any authenticated user to read their OWN staff row
--    (needed so pages can check the current user's role)
CREATE POLICY "Staff can read own row"
  ON public.staff
  FOR SELECT
  USING (id = auth.uid());

-- ============================================================
-- IMPORTANT: After running the above, insert your existing
-- admin user's row. Find your UUID in:
--   Supabase Dashboard -> Authentication -> Users
-- Then uncomment and run:
-- ============================================================

-- INSERT INTO public.staff (id, email, role)
-- VALUES (
--   'YOUR-ADMIN-USER-UUID-HERE',
--   'your-admin@email.com',
--   'admin'
-- )
-- ON CONFLICT (id) DO NOTHING;
