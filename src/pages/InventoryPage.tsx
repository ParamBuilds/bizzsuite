import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Search, Package, MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  type: string;
  unit_price: string;
  cost_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  gst_rate: string;
  hsn_sac_code: string;
  is_active: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  sku: '',
  type: 'product',
  unit_price: '',
  cost_price: '',
  stock_quantity: '0',
  low_stock_threshold: '10',
  gst_rate: '18',
  hsn_sac_code: '',
  is_active: true,
};

export default function InventoryPage() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_or_services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      if (!business?.id) {
        throw new Error('Business not found. Please refresh and try again.');
      }
      const { error } = await supabase.from('products_or_services').insert({
        ...data,
        business_id: business.id,
        unit_price: parseFloat(data.unit_price) || 0,
        cost_price: parseFloat(data.cost_price) || 0,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        low_stock_threshold: parseInt(data.low_stock_threshold) || 10,
        gst_rate: parseFloat(data.gst_rate) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Item added successfully');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductForm }) => {
      const { error } = await supabase
        .from('products_or_services')
        .update({
          ...data,
          unit_price: parseFloat(data.unit_price) || 0,
          cost_price: parseFloat(data.cost_price) || 0,
          stock_quantity: parseInt(data.stock_quantity) || 0,
          low_stock_threshold: parseInt(data.low_stock_threshold) || 10,
          gst_rate: parseFloat(data.gst_rate) || 0,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Item updated');
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products_or_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Item deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      type: product.type,
      unit_price: String(product.unit_price),
      cost_price: String(product.cost_price || ''),
      stock_quantity: String(product.stock_quantity),
      low_stock_threshold: String(product.low_stock_threshold),
      gst_rate: String(product.gst_rate || '18'),
      hsn_sac_code: product.hsn_sac_code || '',
      is_active: product.is_active,
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const filteredProducts = products?.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="action-bar">
        <div>
          <h1 className="page-header">Inventory</h1>
          <p className="page-description">Manage your products and services</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(emptyForm);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Item' : 'Add Item'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update item details' : 'Add a new product or service'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN/SAC Code</Label>
                  <Input
                    id="hsn"
                    value={form.hsn_sac_code}
                    onChange={(e) => setForm((f) => ({ ...f, hsn_sac_code: e.target.value }))}
                    placeholder="8471"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Item description..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Selling Price *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={form.unit_price}
                    onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_rate">GST Rate %</Label>
                  <Select
                    value={form.gst_rate}
                    onValueChange={(v) => setForm((f) => ({ ...f, gst_rate: v }))}
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
              </div>
              {form.type === 'product' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={form.stock_quantity}
                      onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low_stock">Low Stock Alert</Label>
                    <Input
                      id="low_stock"
                      type="number"
                      value={form.low_stock_threshold}
                      onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, is_active: c }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update' : 'Add'} Item
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
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="service">Services</SelectItem>
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
          ) : !filteredProducts?.length ? (
            <div className="empty-state">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg">No items yet</h3>
              <p className="text-muted-foreground">Add your first product or service</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">Item</TableHead>
                  <TableHead className="table-header">Type</TableHead>
                  <TableHead className="table-header text-right">Price</TableHead>
                  <TableHead className="table-header text-right">Stock</TableHead>
                  <TableHead className="table-header">GST</TableHead>
                  <TableHead className="table-header">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isLowStock =
                    product.type === 'product' &&
                    product.stock_quantity <= product.low_stock_threshold;
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{Number(product.unit_price).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.type === 'product' ? (
                          <div className="flex items-center justify-end gap-2">
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            )}
                            <span className={cn(isLowStock && 'text-warning font-medium')}>
                              {product.stock_quantity}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{product.gst_rate}%</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'badge-status',
                            product.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
