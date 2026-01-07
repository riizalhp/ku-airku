-- FIX: Drop recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- CREATE: New non-recursive policy using User Metadata
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
  );

-- OPTIONAL: Ensure Sales can also view (if needed)
CREATE POLICY "Sales can view all profiles" ON public.users
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'Sales'
  );
