-- =====================================================
-- PHASE 3: SUPPLY CHAIN & ADVANCED INVENTORY
-- =====================================================

-- Vendor Status
CREATE TYPE public.vendor_status AS ENUM ('active', 'inactive', 'blacklisted', 'pending_approval');

-- PO Status
CREATE TYPE public.po_status AS ENUM ('draft', 'pending_approval', 'approved', 'sent', 'partially_received', 'received', 'cancelled');

-- GRN Status  
CREATE TYPE public.grn_status AS ENUM ('pending', 'inspecting', 'accepted', 'rejected', 'partially_accepted');

-- Stock Transfer Status
CREATE TYPE public.transfer_status AS ENUM ('draft', 'pending', 'in_transit', 'received', 'cancelled');

-- Asset Status
CREATE TYPE public.asset_status AS ENUM ('active', 'under_maintenance', 'retired', 'disposed', 'in_repair');

-- Maintenance Type
CREATE TYPE public.maintenance_type AS ENUM ('preventive', 'corrective', 'breakdown', 'predictive');

-- Production Status
CREATE TYPE public.production_status AS ENUM ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled');

-- NCR Status
CREATE TYPE public.ncr_status AS ENUM ('open', 'investigating', 'corrective_action', 'closed', 'verified');

-- =====================================================
-- VENDORS
-- =====================================================
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  legal_name TEXT,
  gstin TEXT,
  pan TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_limit NUMERIC DEFAULT 0,
  status vendor_status DEFAULT 'active',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, code)
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vendors in their org"
  ON public.vendors FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage vendors in their org"
  ON public.vendors FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE RESTRICT NOT NULL,
  po_number TEXT NOT NULL,
  status po_status DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, po_number)
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view POs in their org"
  ON public.purchase_orders FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage POs in their org"
  ON public.purchase_orders FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- PURCHASE ORDER ITEMS
-- =====================================================
CREATE TABLE public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  received_quantity NUMERIC DEFAULT 0,
  unit_price NUMERIC NOT NULL,
  gst_rate NUMERIC DEFAULT 18,
  gst_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  hsn_sac_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view PO items via PO"
  ON public.purchase_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.purchase_orders po 
    WHERE po.id = purchase_order_id 
    AND po.organization_id = public.get_user_organization_id()
  ));

CREATE POLICY "Users can manage PO items via PO"
  ON public.purchase_order_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.purchase_orders po 
    WHERE po.id = purchase_order_id 
    AND po.organization_id = public.get_user_organization_id()
  ));

-- =====================================================
-- GOODS RECEIVED NOTES (GRN)
-- =====================================================
CREATE TABLE public.goods_received_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE RESTRICT NOT NULL,
  grn_number TEXT NOT NULL,
  status grn_status DEFAULT 'pending',
  received_date DATE DEFAULT CURRENT_DATE,
  invoice_number TEXT,
  invoice_date DATE,
  vehicle_number TEXT,
  driver_name TEXT,
  notes TEXT,
  inspected_by UUID,
  inspected_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, grn_number)
);

ALTER TABLE public.goods_received_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view GRNs in their org"
  ON public.goods_received_notes FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage GRNs in their org"
  ON public.goods_received_notes FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- GRN ITEMS
-- =====================================================
CREATE TABLE public.grn_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID REFERENCES public.goods_received_notes(id) ON DELETE CASCADE NOT NULL,
  po_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  ordered_quantity NUMERIC DEFAULT 0,
  received_quantity NUMERIC NOT NULL,
  accepted_quantity NUMERIC DEFAULT 0,
  rejected_quantity NUMERIC DEFAULT 0,
  batch_number TEXT,
  lot_number TEXT,
  manufacture_date DATE,
  expiry_date DATE,
  unit_price NUMERIC DEFAULT 0,
  inspection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view GRN items via GRN"
  ON public.grn_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.goods_received_notes grn 
    WHERE grn.id = grn_id 
    AND grn.organization_id = public.get_user_organization_id()
  ));

CREATE POLICY "Users can manage GRN items via GRN"
  ON public.grn_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.goods_received_notes grn 
    WHERE grn.id = grn_id 
    AND grn.organization_id = public.get_user_organization_id()
  ));

-- =====================================================
-- STOCK LEDGER (Immutable Audit Trail)
-- =====================================================
CREATE TABLE public.stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'scrap', 'return'
  reference_type TEXT, -- 'grn', 'invoice', 'transfer', 'adjustment', 'production'
  reference_id UUID,
  batch_number TEXT,
  lot_number TEXT,
  quantity_in NUMERIC DEFAULT 0,
  quantity_out NUMERIC DEFAULT 0,
  balance_after NUMERIC NOT NULL,
  unit_cost NUMERIC DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Stock ledger is append-only
ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock ledger in their org"
  ON public.stock_ledger FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert stock ledger entries"
  ON public.stock_ledger FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.get_user_organization_id());

-- =====================================================
-- STOCK TRANSFERS
-- =====================================================
CREATE TABLE public.stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  transfer_number TEXT NOT NULL,
  from_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT NOT NULL,
  to_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT NOT NULL,
  status transfer_status DEFAULT 'draft',
  transfer_date DATE DEFAULT CURRENT_DATE,
  expected_arrival DATE,
  actual_arrival DATE,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, transfer_number)
);

ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfers in their org"
  ON public.stock_transfers FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage transfers in their org"
  ON public.stock_transfers FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- STOCK TRANSFER ITEMS
-- =====================================================
CREATE TABLE public.stock_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES public.stock_transfers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL NOT NULL,
  batch_number TEXT,
  lot_number TEXT,
  quantity NUMERIC NOT NULL,
  received_quantity NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transfer items via transfer"
  ON public.stock_transfer_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.stock_transfers st 
    WHERE st.id = transfer_id 
    AND st.organization_id = public.get_user_organization_id()
  ));

CREATE POLICY "Users can manage transfer items"
  ON public.stock_transfer_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.stock_transfers st 
    WHERE st.id = transfer_id 
    AND st.organization_id = public.get_user_organization_id()
  ));

-- =====================================================
-- ASSETS (Fixed Assets / Equipment)
-- =====================================================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  asset_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- 'machinery', 'equipment', 'vehicle', 'furniture', 'computer', 'other'
  description TEXT,
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  depreciation_rate NUMERIC DEFAULT 0,
  warranty_expiry DATE,
  location TEXT,
  status asset_status DEFAULT 'active',
  assigned_to UUID,
  notes TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, asset_code)
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets in their org"
  ON public.assets FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage assets in their org"
  ON public.assets FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- MAINTENANCE SCHEDULES
-- =====================================================
CREATE TABLE public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  maintenance_type maintenance_type DEFAULT 'preventive',
  frequency_days INTEGER DEFAULT 30,
  last_performed DATE,
  next_due DATE,
  checklist JSONB,
  assigned_to UUID,
  estimated_hours NUMERIC DEFAULT 1,
  estimated_cost NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance schedules"
  ON public.maintenance_schedules FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage maintenance schedules"
  ON public.maintenance_schedules FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- MAINTENANCE LOGS
-- =====================================================
CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.maintenance_schedules(id) ON DELETE SET NULL,
  maintenance_type maintenance_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  performed_date DATE DEFAULT CURRENT_DATE,
  performed_by UUID,
  hours_spent NUMERIC DEFAULT 0,
  parts_used JSONB,
  cost NUMERIC DEFAULT 0,
  findings TEXT,
  actions_taken TEXT,
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view maintenance logs"
  ON public.maintenance_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage maintenance logs"
  ON public.maintenance_logs FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- BILL OF MATERIALS (BOM)
-- =====================================================
CREATE TABLE public.bill_of_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  description TEXT,
  output_quantity NUMERIC DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.bill_of_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view BOMs"
  ON public.bill_of_materials FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage BOMs"
  ON public.bill_of_materials FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- BOM ITEMS
-- =====================================================
CREATE TABLE public.bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID REFERENCES public.bill_of_materials(id) ON DELETE CASCADE NOT NULL,
  component_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'pcs',
  wastage_percent NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view BOM items"
  ON public.bom_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bill_of_materials bom 
    WHERE bom.id = bom_id 
    AND bom.organization_id = public.get_user_organization_id()
  ));

CREATE POLICY "Users can manage BOM items"
  ON public.bom_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.bill_of_materials bom 
    WHERE bom.id = bom_id 
    AND bom.organization_id = public.get_user_organization_id()
  ));

-- =====================================================
-- PRODUCTION ORDERS
-- =====================================================
CREATE TABLE public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  bom_id UUID REFERENCES public.bill_of_materials(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL NOT NULL,
  planned_quantity NUMERIC NOT NULL,
  produced_quantity NUMERIC DEFAULT 0,
  wastage_quantity NUMERIC DEFAULT 0,
  status production_status DEFAULT 'planned',
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, order_number)
);

ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view production orders"
  ON public.production_orders FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage production orders"
  ON public.production_orders FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- QUALITY INSPECTIONS
-- =====================================================
CREATE TABLE public.quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  reference_type TEXT NOT NULL, -- 'grn', 'production', 'finished_goods'
  reference_id UUID NOT NULL,
  inspection_number TEXT NOT NULL,
  inspection_date DATE DEFAULT CURRENT_DATE,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL,
  batch_number TEXT,
  sample_size NUMERIC,
  passed_quantity NUMERIC DEFAULT 0,
  failed_quantity NUMERIC DEFAULT 0,
  parameters JSONB, -- [{name, expected, actual, pass}]
  result TEXT, -- 'pass', 'fail', 'conditional'
  notes TEXT,
  inspected_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, inspection_number)
);

ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quality inspections"
  ON public.quality_inspections FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage quality inspections"
  ON public.quality_inspections FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- NON-CONFORMANCE REPORTS (NCR)
-- =====================================================
CREATE TABLE public.ncr_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  ncr_number TEXT NOT NULL,
  inspection_id UUID REFERENCES public.quality_inspections(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL,
  batch_number TEXT,
  quantity_affected NUMERIC,
  status ncr_status DEFAULT 'open',
  issue_type TEXT, -- 'quality', 'process', 'documentation', 'safety'
  severity TEXT, -- 'minor', 'major', 'critical'
  description TEXT NOT NULL,
  root_cause TEXT,
  immediate_action TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  assigned_to UUID,
  due_date DATE,
  closed_by UUID,
  closed_at TIMESTAMPTZ,
  verification_notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, ncr_number)
);

ALTER TABLE public.ncr_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view NCRs"
  ON public.ncr_reports FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can manage NCRs"
  ON public.ncr_reports FOR ALL
  USING (organization_id = public.get_user_organization_id());

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goods_received_notes_updated_at
  BEFORE UPDATE ON public.goods_received_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stock_transfers_updated_at
  BEFORE UPDATE ON public.stock_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_logs_updated_at
  BEFORE UPDATE ON public.maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bill_of_materials_updated_at
  BEFORE UPDATE ON public.bill_of_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quality_inspections_updated_at
  BEFORE UPDATE ON public.quality_inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ncr_reports_updated_at
  BEFORE UPDATE ON public.ncr_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();