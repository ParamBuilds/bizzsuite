
-- Fix RLS policies for businesses table to handle new user registration flow
-- The issue is that get_user_business_id() returns NULL for new users without a profile

-- Drop existing policies
DROP POLICY IF EXISTS businesses_insert_policy ON public.businesses;
DROP POLICY IF EXISTS businesses_select_policy ON public.businesses;
DROP POLICY IF EXISTS businesses_update_policy ON public.businesses;

-- Create improved policies that handle the registration flow
-- Allow authenticated users to INSERT businesses
CREATE POLICY "businesses_insert_policy" 
ON public.businesses 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to SELECT their own business (via profile) OR businesses they just created
CREATE POLICY "businesses_select_policy" 
ON public.businesses 
FOR SELECT 
TO authenticated 
USING (
  id = get_user_business_id() 
  OR 
  -- Allow selecting businesses that will be linked to the user's profile being created
  NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
);

-- Allow users to UPDATE only their linked business
CREATE POLICY "businesses_update_policy" 
ON public.businesses 
FOR UPDATE 
TO authenticated 
USING (id = get_user_business_id())
WITH CHECK (id = get_user_business_id());

-- Also need to fix profiles table to allow users to link to any business during initial setup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());
