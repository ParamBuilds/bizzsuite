-- Drop existing insert policy on businesses
DROP POLICY IF EXISTS "Authenticated users can insert business" ON public.businesses;

-- Create simpler insert policy - any authenticated user can create a business
CREATE POLICY "Authenticated users can create businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also ensure profiles table allows insert/update for the seeding process
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());