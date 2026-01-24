import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2, MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageWrapper, MotionContainer, MotionItem } from '@/components/ui/motion';

const statusStyles = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  blacklisted: 'bg-destructive/10 text-destructive',
  pending_approval: 'bg-warning/10 text-warning',
};

interface VendorForm {
  name: string;
  code: string;
  legal_name: string;
  gstin: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  payment_terms: number;
  notes: string;
}

const emptyForm: VendorForm = {
  name: '',
  code: '',
  legal_name: '',
  gstin: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  payment_terms: 30,
  notes: '',
};

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<VendorForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VendorForm) => {
      // Get organization_id from user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('organization_id')
        .single();
      
      if (!roleData?.organization_id) {
        throw new Error('No organization found. Please set up your organization first.');
      }

      const { error } = await supabase
        .from('vendors')
        .insert({ ...data, organization_id: roleData.organization_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VendorForm }) => {
      const { error } = await supabase.from('vendors').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor updated successfully');
      setIsOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (vendor: any) => {
    setForm({
      name: vendor.name,
      code: vendor.code || '',
      legal_name: vendor.legal_name || '',
      gstin: vendor.gstin || '',
      contact_name: vendor.contact_name || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      payment_terms: vendor.payment_terms || 30,
      notes: vendor.notes || '',
    });
    setEditingId(vendor.id);
    setIsOpen(true);
  };

  const filteredVendors = vendors?.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code?.toLowerCase().includes(search.toLowerCase()) ||
      v.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="action-bar">
            <div>
              <h1 className="page-header">Vendors</h1>
              <p className="page-description">Manage your suppliers and vendors</p>
            </div>
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                  setForm(emptyForm);
                  setEditingId(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update vendor details' : 'Add a new vendor to your system'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vendor Name *</Label>
                      <Input
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Vendor name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vendor Code</Label>
                      <Input
                        value={form.code}
                        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                        placeholder="VND-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Legal Name</Label>
                      <Input
                        value={form.legal_name}
                        onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
                        placeholder="Legal business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GSTIN</Label>
                      <Input
                        value={form.gstin}
                        onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input
                        value={form.contact_name}
                        onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="vendor@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Full address"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms (days)</Label>
                      <Input
                        type="number"
                        value={form.payment_terms}
                        onChange={(e) => setForm((f) => ({ ...f, payment_terms: parseInt(e.target.value) || 30 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? 'Update' : 'Create'} Vendor
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </MotionItem>

        <MotionItem>
          <Card>
            <CardHeader className="pb-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : !filteredVendors?.length ? (
                <div className="empty-state">
                  <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="font-medium text-lg">No vendors yet</h3>
                  <p className="text-muted-foreground">Add your first vendor to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="table-header">Vendor</TableHead>
                      <TableHead className="table-header">Contact</TableHead>
                      <TableHead className="table-header">GSTIN</TableHead>
                      <TableHead className="table-header">Location</TableHead>
                      <TableHead className="table-header">Status</TableHead>
                      <TableHead className="table-header">Rating</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            {vendor.code && (
                              <p className="text-xs text-muted-foreground">{vendor.code}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {vendor.contact_name && <p className="text-sm">{vendor.contact_name}</p>}
                            {vendor.phone && (
                              <p className="text-xs text-muted-foreground">{vendor.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.gstin || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('badge-status capitalize', statusStyles[vendor.status as keyof typeof statusStyles])}>
                            {vendor.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vendor.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span>{vendor.rating}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate(vendor.id)}
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
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
