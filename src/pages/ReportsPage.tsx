import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, IndianRupee, Wallet, FileText, Users } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { StatCard } from '@/components/dashboard/StatCard';

const EXPENSE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#6b7280'];

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>('thisMonth');

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'last6Months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange();
  const startDate = format(start, 'yyyy-MM-dd');
  const endDate = format(end, 'yyyy-MM-dd');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['report-stats', startDate, endDate],
    queryFn: async () => {
      const [invoicesRes, expensesRes, customersRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('total_amount, status, issue_date')
          .gte('issue_date', startDate)
          .lte('issue_date', endDate),
        supabase
          .from('expenses')
          .select('amount, category, expense_date')
          .gte('expense_date', startDate)
          .lte('expense_date', endDate),
        supabase.from('customers').select('id, created_at'),
        supabase.from('products_or_services').select('id, stock_quantity, unit_price'),
      ]);

      // Revenue calculations
      const totalRevenue = invoicesRes.data
        ?.filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

      const pendingRevenue = invoicesRes.data
        ?.filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0) || 0;

      // Expense calculations
      const totalExpenses = expensesRes.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      // Expense by category
      const expenseByCategory: Record<string, number> = {};
      expensesRes.data?.forEach((exp) => {
        expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + Number(exp.amount);
      });

      const expenseCategoryData = Object.entries(expenseByCategory).map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
      }));

      // Monthly revenue data
      const monthlyData: Record<string, { revenue: number; expenses: number }> = {};
      invoicesRes.data?.forEach((inv) => {
        if (inv.status === 'paid') {
          const month = format(new Date(inv.issue_date), 'MMM');
          if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
          monthlyData[month].revenue += Number(inv.total_amount);
        }
      });
      expensesRes.data?.forEach((exp) => {
        const month = format(new Date(exp.expense_date), 'MMM');
        if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
        monthlyData[month].expenses += Number(exp.amount);
      });

      const monthlyChartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }));

      // Inventory value
      const inventoryValue = productsRes.data?.reduce(
        (sum, p) => sum + Number(p.stock_quantity) * Number(p.unit_price),
        0
      ) || 0;

      return {
        totalRevenue,
        pendingRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        invoiceCount: invoicesRes.data?.length || 0,
        customerCount: customersRes.data?.length || 0,
        inventoryValue,
        expenseCategoryData,
        monthlyChartData,
      };
    },
  });

  const exportCSV = () => {
    if (!stats) return;

    const csvContent = [
      ['Report Period', format(start, 'dd MMM yyyy') + ' - ' + format(end, 'dd MMM yyyy')],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', stats.totalRevenue],
      ['Total Expenses', stats.totalExpenses],
      ['Net Profit', stats.profit],
      ['Pending Revenue', stats.pendingRevenue],
      ['Invoice Count', stats.invoiceCount],
      ['Customer Count', stats.customerCount],
      ['Inventory Value', stats.inventoryValue],
      [],
      ['Expense by Category'],
      ...stats.expenseCategoryData.map((e) => [e.name, e.value]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="action-bar">
        <div>
          <h1 className="page-header">Reports</h1>
          <p className="page-description">Financial insights and business analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              icon={IndianRupee}
              variant="primary"
            />
            <StatCard
              title="Net Profit"
              value={`₹${(stats?.profit || 0).toLocaleString()}`}
              icon={(stats?.profit || 0) >= 0 ? TrendingUp : TrendingDown}
              variant={(stats?.profit || 0) >= 0 ? 'success' : 'default'}
            />
            <StatCard
              title="Total Expenses"
              value={`₹${(stats?.totalExpenses || 0).toLocaleString()}`}
              icon={Wallet}
              variant="warning"
            />
            <StatCard
              title="Pending Revenue"
              value={`₹${(stats?.pendingRevenue || 0).toLocaleString()}`}
              icon={FileText}
              variant="accent"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {(stats?.monthlyChartData?.length || 0) > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                        <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                        />
                        <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for this period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {(stats?.expenseCategoryData?.length || 0) > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.expenseCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats?.expenseCategoryData?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expense data for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold">{stats?.invoiceCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-bold">{stats?.customerCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10 text-success">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inventory Value</p>
                    <p className="text-2xl font-bold">₹{(stats?.inventoryValue || 0).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
