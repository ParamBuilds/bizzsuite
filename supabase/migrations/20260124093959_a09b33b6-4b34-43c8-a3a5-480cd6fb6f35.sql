-- Make audit_logs truly append-only by removing any existing policies and creating strict ones

-- Drop existing policies on audit_logs if they exist
DROP POLICY IF EXISTS "Users can view their org audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No one can update audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No one can delete audit logs" ON public.audit_logs;

-- Enable RLS if not already enabled
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view audit logs for their organization
CREATE POLICY "Users can view their org audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- INSERT: Only allow inserts via service role (no direct user inserts)
-- This policy denies all authenticated user inserts - only service_role can insert
CREATE POLICY "Only service role can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (false);

-- Explicitly deny UPDATE - no one can modify audit logs
CREATE POLICY "No one can update audit logs" 
ON public.audit_logs 
FOR UPDATE 
USING (false)
WITH CHECK (false);

-- Explicitly deny DELETE - no one can delete audit logs  
CREATE POLICY "No one can delete audit logs" 
ON public.audit_logs 
FOR DELETE 
USING (false);