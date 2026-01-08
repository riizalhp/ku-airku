-- Fix RLS policies for users table to allow users to read their own profile

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Sales can view all profiles" ON public.users;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR
SELECT USING (auth.uid () = id);

-- Allow Admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.users FOR
SELECT USING (
        (
            auth.jwt () -> 'user_metadata' ->> 'role'
        ) = 'Admin'
    );

-- Allow Sales to view all profiles
CREATE POLICY "Sales can view all profiles" ON public.users FOR
SELECT USING (
        (
            auth.jwt () -> 'user_metadata' ->> 'role'
        ) = 'Sales'
    );