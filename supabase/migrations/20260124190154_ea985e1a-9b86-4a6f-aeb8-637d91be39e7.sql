-- First drop ALL existing policies on businesses to start fresh
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;
DROP POLICY IF EXISTS "Users can update their business" ON public.businesses;
DROP POLICY IF EXISTS "Users can view their business" ON public.businesses;

-- Create clean, separate policies for each operation
-- INSERT: Any authenticated user can create a business
CREATE POLICY "businesses_insert_policy"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- SELECT: Users can view their own business (via profile link)
CREATE POLICY "businesses_select_policy"
ON public.businesses
FOR SELECT
TO authenticated
USING (id = get_user_business_id());

-- UPDATE: Users can update their own business
CREATE POLICY "businesses_update_policy"
ON public.businesses
FOR UPDATE
TO authenticated
USING (id = get_user_business_id())
WITH CHECK (id = get_user_business_id());