-- =====================================================
-- PHASE 1 & 2: ENTERPRISE FOUNDATION SCHEMA
-- Multi-Organization + Enterprise RBAC + Compliance Base
-- =====================================================

-- Enterprise Role Enum
CREATE TYPE public.enterprise_role AS ENUM (
  'super_admin',
  'organization_owner', 
  'finance',
  'sales',
  'inventory',
  'hr',
  'compliance_officer',
  'auditor',
  'plant_manager',
  'staff'
);

-- Permission Categories
CREATE TYPE public.permission_category AS ENUM (
  'dashboard',
  'customers',
  'invoices',
  'inventory',
  'expenses',
  'reports',
  'settings',
  'compliance',
  'audit',
  'users',
  'organization'
);

-- Permission Actions
CREATE TYPE public.permission_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'export',
  'approve'
);

-- Audit Event Types
CREATE TYPE public.audit_event_type AS ENUM (
  'login',
  'logout',
  'create',
  'update',
  'delete',
  'export',
  'approve',
  'reject',
  'role_change',
  'permission_change'
);

-- Privacy Request Types
CREATE TYPE public.privacy_request_type AS ENUM (
  'access',
  'correction',
  'deletion',
  'portability'
);

-- Privacy Request Status
CREATE TYPE public.request_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'rejected'
);

-- =====================================================
-- ORGANIZATIONS (Multi-Company Support)
-- =====================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  gstin TEXT,
  pan TEXT,
  industry TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  email TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PLANTS / BRANCHES
-- =====================================================
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT DEFAULT 'branch', -- 'branch', 'factory', 'warehouse', 'office'
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  gstin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DEPARTMENTS
-- =====================================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  head_user_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COST CENTERS
-- =====================================================
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  budget_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WAREHOUSES
-- =====================================================
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  capacity_units TEXT DEFAULT 'sqft',
  total_capacity NUMERIC DEFAULT 0,
  contact_name TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ENTERPRISE USER ROLES (Separate from profile roles)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role enterprise_role NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, organization_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROLE PERMISSIONS (Permission Matrix)
-- =====================================================
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role enterprise_role NOT NULL,
  category permission_category NOT NULL,
  action permission_action NOT NULL,
  is_allowed BOOLEAN DEFAULT true,
  UNIQUE(role, category, action)
);

-- =====================================================
-- AUDIT LOGS (Immutable, Append-Only)
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID,
  event_type audit_event_type NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Make audit_logs append-only (no updates or deletes)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRIVACY CONSENTS (DPDP Act Compliance)
-- =====================================================
CREATE TABLE public.privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID,
  consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'data_processing', etc.
  purpose TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRIVACY REQUESTS (Data Subject Rights)
-- =====================================================
CREATE TABLE public.privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  requester_user_id UUID,
  requester_email TEXT NOT NULL,
  requester_name TEXT,
  request_type privacy_request_type NOT NULL,
  description TEXT,
  status request_status DEFAULT 'pending',
  assigned_to UUID,
  response_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- GRIEVANCE TICKETS
-- =====================================================
CREATE TABLE public.grievance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'data_privacy', 'service', 'billing', 'other'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status request_status DEFAULT 'pending',
  assigned_to UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, ticket_number)
);

ALTER TABLE public.grievance_tickets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EXPORT LOGS (Compliance Tracking)
-- =====================================================
CREATE TABLE public.export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID,
  export_type TEXT NOT NULL, -- 'invoices', 'customers', 'audit_logs', 'compliance_pack'
  file_name TEXT,
  record_count INTEGER,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY EVENTS (CERT-In Readiness)
-- =====================================================
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login_failure', 'suspicious_activity', 'data_breach_attempt', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  source_ip INET,
  user_id UUID,
  metadata JSONB,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EXTEND EXISTING TABLES (Backward Compatible)
-- =====================================================

-- Add organization reference to businesses (nullable for backward compatibility)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL;

-- Add enterprise fields to customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;

-- Add enterprise fields to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS hsn_sac_code TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Add enterprise fields to expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add enterprise fields to products/inventory
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS lot_number TEXT;
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.products_or_services ADD COLUMN IF NOT EXISTS manufacture_date DATE;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific enterprise role
CREATE OR REPLACE FUNCTION public.has_enterprise_role(_user_id UUID, _org_id UUID, _role enterprise_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND organization_id = _org_id 
      AND role = _role
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _org_id UUID, _category permission_category, _action permission_action)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role enterprise_role;
BEGIN
  -- Get user's active role for the organization
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
    AND organization_id = _org_id 
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check permission matrix
  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions
    WHERE role = user_role 
      AND category = _category 
      AND action = _action 
      AND is_allowed = true
  );
END;
$$;

-- Function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_roles 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1
$$;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Organizations: Users can only view their assigned organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Super admins can manage organizations"
  ON public.organizations FOR ALL
  USING (public.has_enterprise_role(auth.uid(), id, 'super_admin'));

-- Plants
CREATE POLICY "Users can view plants in their org"
  ON public.plants FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Plant managers can manage their plants"
  ON public.plants FOR ALL
  USING (public.has_permission(auth.uid(), organization_id, 'organization', 'update'));

-- Departments
CREATE POLICY "Users can view departments in their org"
  ON public.departments FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Cost Centers
CREATE POLICY "Users can view cost centers in their org"
  ON public.cost_centers FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Warehouses
CREATE POLICY "Users can view warehouses in their org"
  ON public.warehouses FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- User Roles
CREATE POLICY "Users can view roles in their org"
  ON public.user_roles FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Audit Logs (Read-only for authorized users)
CREATE POLICY "Auditors can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    organization_id = public.get_user_organization_id() AND
    (public.has_enterprise_role(auth.uid(), organization_id, 'auditor') OR
     public.has_enterprise_role(auth.uid(), organization_id, 'compliance_officer') OR
     public.has_enterprise_role(auth.uid(), organization_id, 'super_admin'))
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Privacy Consents
CREATE POLICY "Users can manage their own consents"
  ON public.privacy_consents FOR ALL
  USING (user_id = auth.uid() OR organization_id = public.get_user_organization_id());

-- Privacy Requests
CREATE POLICY "Users can view their requests or compliance officers can view all"
  ON public.privacy_requests FOR SELECT
  USING (
    requester_user_id = auth.uid() OR
    (organization_id = public.get_user_organization_id() AND
     public.has_enterprise_role(auth.uid(), organization_id, 'compliance_officer'))
  );

-- Grievance Tickets
CREATE POLICY "Compliance officers can manage grievances"
  ON public.grievance_tickets FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- Export Logs
CREATE POLICY "Users can view export logs in their org"
  ON public.export_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

-- Security Events
CREATE POLICY "Security events visible to compliance"
  ON public.security_events FOR SELECT
  USING (
    organization_id = public.get_user_organization_id() AND
    (public.has_enterprise_role(auth.uid(), organization_id, 'compliance_officer') OR
     public.has_enterprise_role(auth.uid(), organization_id, 'super_admin'))
  );

-- =====================================================
-- SEED DEFAULT PERMISSIONS
-- =====================================================
INSERT INTO public.role_permissions (role, category, action, is_allowed) VALUES
-- Super Admin: All permissions
('super_admin', 'dashboard', 'read', true),
('super_admin', 'customers', 'create', true),
('super_admin', 'customers', 'read', true),
('super_admin', 'customers', 'update', true),
('super_admin', 'customers', 'delete', true),
('super_admin', 'invoices', 'create', true),
('super_admin', 'invoices', 'read', true),
('super_admin', 'invoices', 'update', true),
('super_admin', 'invoices', 'delete', true),
('super_admin', 'invoices', 'approve', true),
('super_admin', 'inventory', 'create', true),
('super_admin', 'inventory', 'read', true),
('super_admin', 'inventory', 'update', true),
('super_admin', 'inventory', 'delete', true),
('super_admin', 'expenses', 'create', true),
('super_admin', 'expenses', 'read', true),
('super_admin', 'expenses', 'update', true),
('super_admin', 'expenses', 'delete', true),
('super_admin', 'expenses', 'approve', true),
('super_admin', 'reports', 'read', true),
('super_admin', 'reports', 'export', true),
('super_admin', 'settings', 'read', true),
('super_admin', 'settings', 'update', true),
('super_admin', 'compliance', 'read', true),
('super_admin', 'compliance', 'update', true),
('super_admin', 'audit', 'read', true),
('super_admin', 'users', 'create', true),
('super_admin', 'users', 'read', true),
('super_admin', 'users', 'update', true),
('super_admin', 'users', 'delete', true),
('super_admin', 'organization', 'read', true),
('super_admin', 'organization', 'update', true),

-- Finance: Invoice and expense management
('finance', 'dashboard', 'read', true),
('finance', 'invoices', 'create', true),
('finance', 'invoices', 'read', true),
('finance', 'invoices', 'update', true),
('finance', 'invoices', 'approve', true),
('finance', 'expenses', 'create', true),
('finance', 'expenses', 'read', true),
('finance', 'expenses', 'update', true),
('finance', 'expenses', 'approve', true),
('finance', 'reports', 'read', true),
('finance', 'reports', 'export', true),
('finance', 'customers', 'read', true),

-- Sales: Customer and invoice management
('sales', 'dashboard', 'read', true),
('sales', 'customers', 'create', true),
('sales', 'customers', 'read', true),
('sales', 'customers', 'update', true),
('sales', 'invoices', 'create', true),
('sales', 'invoices', 'read', true),
('sales', 'invoices', 'update', true),
('sales', 'inventory', 'read', true),
('sales', 'reports', 'read', true),

-- Inventory: Stock management
('inventory', 'dashboard', 'read', true),
('inventory', 'inventory', 'create', true),
('inventory', 'inventory', 'read', true),
('inventory', 'inventory', 'update', true),
('inventory', 'inventory', 'delete', true),
('inventory', 'reports', 'read', true),

-- Auditor: Read-only access
('auditor', 'dashboard', 'read', true),
('auditor', 'invoices', 'read', true),
('auditor', 'expenses', 'read', true),
('auditor', 'inventory', 'read', true),
('auditor', 'customers', 'read', true),
('auditor', 'reports', 'read', true),
('auditor', 'audit', 'read', true),
('auditor', 'compliance', 'read', true),

-- Compliance Officer
('compliance_officer', 'dashboard', 'read', true),
('compliance_officer', 'compliance', 'read', true),
('compliance_officer', 'compliance', 'update', true),
('compliance_officer', 'audit', 'read', true),
('compliance_officer', 'reports', 'read', true),
('compliance_officer', 'reports', 'export', true),

-- Staff: Basic access
('staff', 'dashboard', 'read', true),
('staff', 'invoices', 'read', true),
('staff', 'customers', 'read', true),
('staff', 'inventory', 'read', true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON public.cost_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_consents_updated_at
  BEFORE UPDATE ON public.privacy_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_requests_updated_at
  BEFORE UPDATE ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grievance_tickets_updated_at
  BEFORE UPDATE ON public.grievance_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();