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
import { Plus, Search, Wallet, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const categoryOptions = [
  { value: 'rent', label: 'Rent', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'utilities', label: 'Utilities', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'salaries', label: 'Salaries', color: 'bg-green-500/10 text-green-600' },
  { value: 'marketing', label: 'Marketing', color: 'bg-purple-500/10 text-purple-600' },
  { value: 'supplies', label: 'Supplies', color: 'bg-orange-500/10 text-orange-600' },
  { value: 'travel', label: 'Travel', color: 'bg-pink-500/10 text-pink-600' },
  { value: 'other', label: 'Other', color: 'bg-gray-500/10 text-gray-600' },
];

type ExpenseCategory = 'rent' | 'utilities' | 'salaries' | 'marketing' | 'supplies' | 'travel' | 'other';

interface ExpenseForm {
  category: ExpenseCategory;
  description: string;
  amount: string;
  expense_date: string;
  vendor: string;
  notes: string;
}

const emptyForm: ExpenseForm = {
  category: 'other',
  description: '',
  amount: '',
  expense_date: format(new Date(), 'yyyy-MM-dd'),
  vendor: '',
  notes: '',
};

export default function ExpensesPage() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      if (!business?.id) {
        throw new Error('Business not found. Please refresh and try again.');
      }
      const { error } = await supabase.from('expenses').insert({
        ...data,
        business_id: business.id,
        amount: parseFloat(data.amount) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Expense added successfully');
      setIsOpen(false);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseForm }) => {
      const { error } = await supabase
        .from('expenses')
        .update({
          ...data,
          amount: parseFloat(data.amount) || 0,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Expense updated');
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Expense deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Valid amount is required');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (expense: any) => {
    setForm({
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: String(expense.amount),
      expense_date: expense.expense_date,
      vendor: expense.vendor || '',
      notes: expense.notes || '',
    });
    setEditingId(expense.id);
    setIsOpen(true);
  };

  const filteredExpenses = expenses?.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="action-bar">
        <div>
          <h1 className="page-header">Expenses</h1>
          <p className="page-description">Track and manage your business expenses</p>
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
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update expense details' : 'Record a new business expense'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v as ExpenseCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={form.expense_date}
                    onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What was this expense for?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={form.vendor}
                    onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                    placeholder="Vendor name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update' : 'Add'} Expense
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="stat-card bg-destructive/5 border-destructive/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="metric-label">Total Expenses (filtered)</p>
            <p className="metric-value text-destructive">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive">
            <Wallet className="h-6 w-6" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
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
          ) : !filteredExpenses?.length ? (
            <div className="empty-state">
              <Wallet className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg">No expenses yet</h3>
              <p className="text-muted-foreground">Start tracking your business expenses</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-header">Date</TableHead>
                  <TableHead className="table-header">Description</TableHead>
                  <TableHead className="table-header">Category</TableHead>
                  <TableHead className="table-header">Vendor</TableHead>
                  <TableHead className="table-header text-right">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const category = categoryOptions.find((c) => c.value === expense.category);
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-muted-foreground">
                        {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <Badge className={cn('badge-status', category?.color)}>
                          {category?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.vendor || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        ₹{Number(expense.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(expense.id)}
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
