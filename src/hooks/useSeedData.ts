import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { toast } from 'sonner';

const sampleCustomers = [
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98765 43210', address: '123 MG Road, Mumbai, Maharashtra 400001' },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '+91 98765 43211', address: '456 Anna Salai, Chennai, Tamil Nadu 600002' },
  { name: 'Anita Desai', email: 'anita.desai@example.com', phone: '+91 98765 43212', address: '789 Brigade Road, Bangalore, Karnataka 560001' },
  { name: 'Vikram Patel', email: 'vikram.patel@example.com', phone: '+91 98765 43213', address: '321 SG Highway, Ahmedabad, Gujarat 380015' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+91 98765 43214', address: '654 Hitech City, Hyderabad, Telangana 500081' },
];

const sampleProducts = [
  { name: 'Web Development Package', type: 'service', unit_price: 75000, gst_rate: 18, description: 'Full-stack web application development' },
  { name: 'Mobile App Development', type: 'service', unit_price: 120000, gst_rate: 18, description: 'iOS and Android mobile application' },
  { name: 'SEO Optimization', type: 'service', unit_price: 15000, gst_rate: 18, description: 'Monthly SEO services' },
  { name: 'Logo Design', type: 'service', unit_price: 8000, gst_rate: 18, description: 'Professional logo design with revisions' },
  { name: 'Laptop Stand', type: 'product', unit_price: 2500, cost_price: 1500, gst_rate: 18, stock_quantity: 50, low_stock_threshold: 10, sku: 'LS-001' },
  { name: 'Wireless Keyboard', type: 'product', unit_price: 3500, cost_price: 2200, gst_rate: 18, stock_quantity: 30, low_stock_threshold: 5, sku: 'WK-002' },
  { name: 'USB-C Hub', type: 'product', unit_price: 4500, cost_price: 2800, gst_rate: 18, stock_quantity: 25, low_stock_threshold: 8, sku: 'UH-003' },
  { name: 'Monitor Light Bar', type: 'product', unit_price: 5000, cost_price: 3200, gst_rate: 18, stock_quantity: 3, low_stock_threshold: 5, sku: 'ML-004' },
];

const expenseCategories = ['rent', 'utilities', 'salaries', 'marketing', 'supplies', 'travel', 'other'] as const;

const sampleExpenses = [
  { description: 'Office Rent - January', amount: 45000, category: 'rent', vendor: 'ABC Properties' },
  { description: 'Electricity Bill', amount: 8500, category: 'utilities', vendor: 'MSEDCL' },
  { description: 'Internet Connection', amount: 2000, category: 'utilities', vendor: 'Jio Fiber' },
  { description: 'Google Ads Campaign', amount: 15000, category: 'marketing', vendor: 'Google' },
  { description: 'Office Supplies', amount: 3500, category: 'supplies', vendor: 'Amazon Business' },
  { description: 'Client Meeting Travel', amount: 5000, category: 'travel', vendor: 'MakeMyTrip' },
  { description: 'Software Subscriptions', amount: 12000, category: 'other', vendor: 'Various' },
];

export const useSeedData = () => {
  const { business } = useBusiness();
  const queryClient = useQueryClient();

  const seedMutation = useMutation({
    mutationFn: async () => {
      if (!business?.id) throw new Error('No business found');

      // Insert customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .insert(sampleCustomers.map(c => ({ ...c, business_id: business.id })))
        .select();
      if (customersError) throw customersError;

      // Insert products/services
      const { data: productsData, error: productsError } = await supabase
        .from('products_or_services')
        .insert(sampleProducts.map(p => ({ ...p, business_id: business.id, is_active: true })))
        .select();
      if (productsError) throw productsError;

      // Insert expenses (spread over past 3 months)
      const today = new Date();
      const expensesToInsert = sampleExpenses.map((e, index) => {
        const monthOffset = index % 3;
        const date = new Date(today.getFullYear(), today.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);
        return {
          description: e.description,
          amount: e.amount,
          category: e.category as 'rent' | 'utilities' | 'salaries' | 'marketing' | 'supplies' | 'travel' | 'other',
          vendor: e.vendor,
          business_id: business.id,
          expense_date: date.toISOString().split('T')[0],
        };
      });
      
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(expensesToInsert);
      if (expensesError) throw expensesError;

      // Create sample invoices
      const invoicesToCreate = [
        { customer_index: 0, product_indices: [0], status: 'paid' as const, daysAgo: 45 },
        { customer_index: 1, product_indices: [1], status: 'paid' as const, daysAgo: 30 },
        { customer_index: 2, product_indices: [4, 5], status: 'sent' as const, daysAgo: 15 },
        { customer_index: 3, product_indices: [2, 3], status: 'draft' as const, daysAgo: 5 },
        { customer_index: 4, product_indices: [6, 7], status: 'overdue' as const, daysAgo: 60 },
      ];

      for (let i = 0; i < invoicesToCreate.length; i++) {
        const inv = invoicesToCreate[i];
        const customer = customersData[inv.customer_index];
        const products = inv.product_indices.map(pi => productsData[pi]);
        
        const issueDate = new Date();
        issueDate.setDate(issueDate.getDate() - inv.daysAgo);
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 30);

        let subtotal = 0;
        let taxAmount = 0;
        
        products.forEach(p => {
          const price = Number(p.unit_price);
          const gstRate = Number(p.gst_rate) || 18;
          subtotal += price;
          taxAmount += price * (gstRate / 100);
        });

        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            business_id: business.id,
            customer_id: customer.id,
            invoice_number: `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
            status: inv.status,
            issue_date: issueDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            subtotal,
            tax_amount: taxAmount,
            total_amount: subtotal + taxAmount,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Add invoice items
        const items = products.map(p => ({
          invoice_id: invoiceData.id,
          product_id: p.id,
          description: p.name,
          quantity: 1,
          unit_price: Number(p.unit_price),
          gst_rate: Number(p.gst_rate) || 18,
          gst_amount: Number(p.unit_price) * ((Number(p.gst_rate) || 18) / 100),
          total_amount: Number(p.unit_price) * (1 + (Number(p.gst_rate) || 18) / 100),
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);
        if (itemsError) throw itemsError;
      }

      return { customers: customersData.length, products: productsData.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success(`Demo data added: ${data.customers} customers, ${data.products} products, 5 invoices, 7 expenses`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add demo data: ${error.message}`);
    },
  });

  return seedMutation;
};
