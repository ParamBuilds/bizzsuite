-- Fix RLS on role_permissions table (was missing)
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Role permissions are readable by all authenticated users (lookup table)
CREATE POLICY "Authenticated users can read role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can modify role permissions
CREATE POLICY "Super admins can manage role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  );

-- Fix the audit_logs INSERT policy to be more restrictive
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());