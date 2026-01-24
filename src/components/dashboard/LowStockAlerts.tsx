import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Package } from 'lucide-react';

export const LowStockAlerts = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_or_services')
        .select('*')
        .eq('type', 'product')
        .eq('is_active', true)
        .order('stock_quantity', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      // Filter low stock in JS since we can't compare columns in the query builder
      return data?.filter(p => p.stock_quantity <= p.low_stock_threshold) || [];
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="empty-state py-8">
        <Package className="h-10 w-10 text-success/40 mb-3" />
        <p className="text-muted-foreground">All stock levels are healthy</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.sku || 'No SKU'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-warning">{product.stock_quantity} left</p>
            <p className="text-xs text-muted-foreground">Min: {product.low_stock_threshold}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
