-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix overly permissive business insert policy
DROP POLICY IF EXISTS "Users can insert business" ON public.businesses;

-- New users can only insert a business if they don't already have one
CREATE POLICY "Authenticated users can insert business"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND business_id IS NOT NULL
    )
  );