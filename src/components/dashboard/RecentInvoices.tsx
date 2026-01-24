import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusStyles = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-info/10 text-info',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export const RecentInvoices = () => {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (!invoices?.length) {
    return (
      <div className="empty-state py-8">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{invoice.invoice_number}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.customers?.name || 'Unknown Customer'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">₹{Number(invoice.total_amount).toLocaleString()}</p>
            <Badge className={cn('badge-status mt-1', statusStyles[invoice.status as keyof typeof statusStyles])}>
              {invoice.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
