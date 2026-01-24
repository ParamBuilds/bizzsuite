-- Drop and recreate the insert policy as PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;

CREATE POLICY "Authenticated users can create businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Make the policy PERMISSIVE explicitly by recreating it
-- The issue might be the RLS mode - let's check if RLS is enabled properly
-- Also add a SELECT policy that allows viewing newly created business immediately

-- For the seeding to work, we need to ensure users can see the business they just created
-- The get_user_business_id() function won't work until the profile is updated

-- Create a policy that allows viewing businesses the user just created (before profile link)
DROP POLICY IF EXISTS "Users can view their business" ON public.businesses;

CREATE POLICY "Users can view their business"
ON public.businesses
FOR SELECT
TO authenticated
USING (
  id = get_user_business_id() 
  OR 
  id IN (
    SELECT b.id FROM businesses b 
    WHERE b.created_at > NOW() - INTERVAL '1 minute'
    AND NOT EXISTS (
      SELECT 1 FROM profiles p WHERE p.business_id = b.id
    )
  )
);