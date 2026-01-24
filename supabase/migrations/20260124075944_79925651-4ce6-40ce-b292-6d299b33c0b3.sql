-- Create enum types
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.expense_category AS ENUM ('rent', 'utilities', 'salaries', 'marketing', 'supplies', 'travel', 'other');
CREATE TYPE public.user_role AS ENUM ('owner', 'staff');

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'INR',
  gst_enabled BOOLEAN DEFAULT false,
  gstin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'owner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table (CRM)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  gstin TEXT,
  notes TEXT,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products_or_services table (Inventory)
CREATE TABLE public.products_or_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  type TEXT DEFAULT 'product' CHECK (type IN ('product', 'service')),
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  gst_rate DECIMAL(5,2) DEFAULT 0,
  hsn_sac_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status invoice_status DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  is_inter_state BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products_or_services(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT 0,
  gst_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gst_settings table
CREATE TABLE public.gst_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  gstin TEXT,
  legal_name TEXT,
  trade_name TEXT,
  state_code TEXT,
  default_gst_rate DECIMAL(5,2) DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_or_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's business_id
CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Businesses policies
CREATE POLICY "Users can view their business"
  ON public.businesses FOR SELECT
  USING (id = public.get_user_business_id());

CREATE POLICY "Users can update their business"
  ON public.businesses FOR UPDATE
  USING (id = public.get_user_business_id());

CREATE POLICY "Users can insert business"
  ON public.businesses FOR INSERT
  WITH CHECK (true);

-- Customers policies
CREATE POLICY "Users can view their business customers"
  ON public.customers FOR SELECT
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert customers for their business"
  ON public.customers FOR INSERT
  WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their business customers"
  ON public.customers FOR UPDATE
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can delete their business customers"
  ON public.customers FOR DELETE
  USING (business_id = public.get_user_business_id());

-- Products/Services policies
CREATE POLICY "Users can view their business products"
  ON public.products_or_services FOR SELECT
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert products for their business"
  ON public.products_or_services FOR INSERT
  WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their business products"
  ON public.products_or_services FOR UPDATE
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can delete their business products"
  ON public.products_or_services FOR DELETE
  USING (business_id = public.get_user_business_id());

-- Invoices policies
CREATE POLICY "Users can view their business invoices"
  ON public.invoices FOR SELECT
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert invoices for their business"
  ON public.invoices FOR INSERT
  WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their business invoices"
  ON public.invoices FOR UPDATE
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can delete their business invoices"
  ON public.invoices FOR DELETE
  USING (business_id = public.get_user_business_id());

-- Invoice items policies (through invoice)
CREATE POLICY "Users can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.business_id = public.get_user_business_id()
  ));

CREATE POLICY "Users can insert invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.business_id = public.get_user_business_id()
  ));

CREATE POLICY "Users can update invoice items"
  ON public.invoice_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.business_id = public.get_user_business_id()
  ));

CREATE POLICY "Users can delete invoice items"
  ON public.invoice_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND invoices.business_id = public.get_user_business_id()
  ));

-- Expenses policies
CREATE POLICY "Users can view their business expenses"
  ON public.expenses FOR SELECT
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert expenses for their business"
  ON public.expenses FOR INSERT
  WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their business expenses"
  ON public.expenses FOR UPDATE
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can delete their business expenses"
  ON public.expenses FOR DELETE
  USING (business_id = public.get_user_business_id());

-- GST settings policies
CREATE POLICY "Users can view their business gst settings"
  ON public.gst_settings FOR SELECT
  USING (business_id = public.get_user_business_id());

CREATE POLICY "Users can insert gst settings for their business"
  ON public.gst_settings FOR INSERT
  WITH CHECK (business_id = public.get_user_business_id());

CREATE POLICY "Users can update their business gst settings"
  ON public.gst_settings FOR UPDATE
  USING (business_id = public.get_user_business_id());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products_or_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gst_settings_updated_at
  BEFORE UPDATE ON public.gst_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-reduce stock on invoice creation
CREATE OR REPLACE FUNCTION public.reduce_stock_on_invoice_item()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products_or_services
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id AND type = 'product';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reduce_stock_on_invoice_item_insert
  AFTER INSERT ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_invoice_item();

-- Function to update customer total spent
CREATE OR REPLACE FUNCTION public.update_customer_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE public.customers
    SET total_spent = total_spent + NEW.total_amount
    WHERE id = NEW.customer_id;
  ELSIF OLD.status = 'paid' AND NEW.status != 'paid' THEN
    UPDATE public.customers
    SET total_spent = total_spent - OLD.total_amount
    WHERE id = OLD.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_customer_spent_on_invoice_update
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_total_spent();

-- Create indexes for performance
CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_products_business_id ON public.products_or_services(business_id);
CREATE INDEX idx_invoices_business_id ON public.invoices(business_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_expenses_business_id ON public.expenses(business_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_business_id ON public.profiles(business_id);