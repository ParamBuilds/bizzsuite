import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentInvoices } from '@/components/dashboard/RecentInvoices';
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Users, FileText, Package, AlertTriangle } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function DashboardPage() {
  const { business } = useBusiness();
  const today = new Date();
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', monthStart, monthEnd],
    queryFn: async () => {
      const [invoicesRes, expensesRes, customersRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('total_amount, status')
          .eq('status', 'paid')
          .gte('issue_date', monthStart)
          .lte('issue_date', monthEnd),
        supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', monthStart)
          .lte('expense_date', monthEnd),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase
          .from('products_or_services')
          .select('id, stock_quantity, low_stock_threshold, type')
          .eq('is_active', true),
      ]);

      const revenue = invoicesRes.data?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;
      const expenses = expensesRes.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const profit = revenue - expenses;
      const customerCount = customersRes.count || 0;
      
      const lowStockCount = productsRes.data?.filter(
        p => p.type === 'product' && p.stock_quantity <= p.low_stock_threshold
      ).length || 0;

      return { revenue, expenses, profit, customerCount, lowStockCount };
    },
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ['pending-invoices-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('invoices')
        .select('id', { count: 'exact' })
        .in('status', ['sent', 'overdue']);
      return count || 0;
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-description">
          Welcome back! Here's your business overview for {format(today, 'MMMM yyyy')}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue This Month"
          value={`₹${(stats?.revenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          variant="primary"
        />
        <StatCard
          title="Profit This Month"
          value={`₹${(stats?.profit || 0).toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total Customers"
          value={stats?.customerCount || 0}
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices || 0}
          icon={FileText}
          variant="warning"
        />
      </div>

      {/* Alerts Banner */}
      {(stats?.lowStockCount || 0) > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div>
            <p className="font-medium text-warning">Stock Alert</p>
            <p className="text-sm text-muted-foreground">
              {stats?.lowStockCount} product(s) are running low on stock
            </p>
          </div>
        </div>
      )}

      {/* Charts and Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue & Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlerts />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentInvoices />
        </CardContent>
      </Card>
    </div>
  );
}
