import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, MoreHorizontal, Pencil, Trash2, Eye, Send, CheckCircle, Download, MessageCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf-generator';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

const statusStyles: Record<InvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-info/10 text-info',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

interface InvoiceForm {
  customer_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  notes: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
}

const generateInvoiceNumber = () => {
  const date = new Date();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${random}`;
};

const emptyForm: InvoiceForm = {
  customer_id: '',
  invoice_number: generateInvoiceNumber(),
  status: 'draft',
  issue_date: format(new Date(), 'yyyy-MM-dd'),
  due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  notes: '',
  items: [{ product_id: null, description: '', quantity: 1, unit_price: 0, gst_rate: 18 }],
};

export default function InvoicesPage() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_or_services')
        .select('id, name, unit_price, gst_rate')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceForm) => {
      // Calculate totals
      let subtotal = 0;
      let taxAmount = 0;
      
      data.items.forEach((item) => {
        const lineTotal = item.quantity * item.unit_price;
        const lineTax = lineTotal * (item.gst_rate / 100);
        subtotal += lineTotal;
        taxAmount += lineTax;
      });

      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          business_id: business?.id,
          customer_id: data.customer_id || null,
          invoice_number: data.invoice_number,
          status: data.status,
          issue_date: data.issue_date,
          due_date: data.due_date || null,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create invoice items
      const itemsToInsert = data.items
        .filter((item) => item.description.trim())
        .map((item) => ({
          invoice_id: invoice.id,
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          gst_rate: item.gst_rate,
          gst_amount: item.quantity * item.unit_price * (item.gst_rate / 100),
          total_amount: item.quantity * item.unit_price * (1 + item.gst_rate / 100),
        }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Invoice created successfully');
      setIsOpen(false);
      setForm({ ...emptyForm, invoice_number: generateInvoiceNumber() });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice status updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Invoice deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      // Fetch invoice with customer and items
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, email, phone, address, gstin)
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      await generateInvoicePDF({
        invoice_number: invoiceData.invoice_number,
        issue_date: invoiceData.issue_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status || 'draft',
        subtotal: Number(invoiceData.subtotal) || 0,
        tax_amount: Number(invoiceData.tax_amount) || 0,
        total_amount: Number(invoiceData.total_amount) || 0,
        notes: invoiceData.notes,
        customer: invoiceData.customers,
        business: business ? {
          name: business.name,
          email: business.email || undefined,
          phone: business.phone || undefined,
          address: business.address || undefined,
          gstin: business.gstin || undefined,
        } : undefined,
        items: itemsData.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          gst_rate: Number(item.gst_rate) || 0,
          gst_amount: Number(item.gst_amount) || 0,
          total_amount: Number(item.total_amount),
        })),
      });
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  const handleWhatsAppShare = async (invoice: any) => {
    const customerPhone = invoice.customers?.phone;
    const customerName = invoice.customers?.name || 'Customer';
    const amount = Number(invoice.total_amount).toLocaleString('en-IN');
    
    const message = encodeURIComponent(
      `Hello ${customerName},\n\n` +
      `Thank you for your business! Here are your invoice details:\n\n` +
      `📄 Invoice: ${invoice.invoice_number}\n` +
      `💰 Amount: ₹${amount}\n` +
      `📅 Due Date: ${invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : 'N/A'}\n\n` +
      `Please let us know if you have any questions.\n\n` +
      `Regards,\n${business?.name || 'Your Business'}`
    );
    
    // Clean phone number (remove spaces, dashes, etc.)
    let phoneNumber = customerPhone?.replace(/[\s\-\(\)]/g, '') || '';
    
    // Add country code if not present (default to India +91)
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('91')) {
        phoneNumber = '+' + phoneNumber;
      } else {
        phoneNumber = '+91' + phoneNumber;
      }
    }
    
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = form.items.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    createMutation.mutate(form);
  };

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, { product_id: null, description: '', quantity: 1, unit_price: 0, gst_rate: 18 }],
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setForm((f) => {
      const newItems = [...f.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...f, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setForm((f) => {
        const newItems = [...f.items];
        newItems[index] = {
          ...newItems[index],
          product_id: productId,
          description: product.name,
          unit_price: Number(product.unit_price),
          gst_rate: Number(product.gst_rate),
        };
        return { ...f, items: newItems };
      });
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    form.items.forEach((item) => {
      const lineTotal = item.quantity * item.unit_price;
      subtotal += lineTotal;
      tax += lineTotal * (item.gst_rate / 100);
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotals();

  const filteredInvoices = invoices?.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="action-bar">
        <div>
          <h1 className="page-header">Invoices</h1>
          <p className="page-description">Create and manage sales invoices</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setForm({ ...emptyForm, invoice_number: generateInvoiceNumber() });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Create a new sales invoice</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input
                    value={form.invoice_number}
                    onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select
                    value={form.customer_id}
                    onValueChange={(v) => setForm((f) => ({ ...f, customer_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <Label>Items</Label>
                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <Select
                        value={item.product_id || ''}
                        onValueChange={(v) => selectProduct(index, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={String(item.gst_rate)}
                        onValueChange={(v) => updateItem(index, 'gst_rate', parseFloat(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        ₹{(item.quantity * item.unit_price * (1 + item.gst_rate / 100)).toFixed(2)}
                      </span>
                      {form.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Invoice notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Create Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : !filteredInvoices?.length ? (
            <div className="empty-state">
              <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg">No invoices yet</h3>
              <p className="text-muted-foreground">Create your first invoice</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">Invoice</TableHead>
                  <TableHead className="table-header">Customer</TableHead>
                  <TableHead className="table-header">Issue Date</TableHead>
                  <TableHead className="table-header">Due Date</TableHead>
                  <TableHead className="table-header">Status</TableHead>
                  <TableHead className="table-header text-right">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customers?.name || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invoice.issue_date), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('badge-status capitalize', statusStyles[invoice.status as InvoiceStatus])}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{Number(invoice.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'sent' })}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ id: invoice.id, status: 'paid' })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDownloadPDF(invoice.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleWhatsAppShare(invoice)}
                            className="text-success"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Share via WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(invoice.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
