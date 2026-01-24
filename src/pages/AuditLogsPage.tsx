import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Download, 
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { PageWrapper, MotionContainer, MotionItem } from '@/components/ui/motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const eventTypeStyles: Record<string, string> = {
  login: 'bg-info/10 text-info',
  logout: 'bg-muted text-muted-foreground',
  create: 'bg-success/10 text-success',
  update: 'bg-warning/10 text-warning',
  delete: 'bg-destructive/10 text-destructive',
  export: 'bg-primary/10 text-primary',
  approve: 'bg-success/10 text-success',
  reject: 'bg-destructive/10 text-destructive',
  role_change: 'bg-accent/10 text-accent',
  permission_change: 'bg-accent/10 text-accent',
};

export default function AuditLogsPage() {
  const [filter, setFilter] = useState<string>('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('event_type', filter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: securityEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const handleExportLogs = () => {
    if (!auditLogs?.length) {
      toast.error('No logs to export');
      return;
    }

    const csv = [
      ['Timestamp', 'Event Type', 'Entity Type', 'Action', 'User ID', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        log.created_at,
        log.event_type,
        log.entity_type,
        log.action,
        log.user_id || '',
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Audit Logs & Security
              </h1>
              <p className="page-description">
                Immutable audit trail for compliance and security monitoring
              </p>
            </div>
            <Button onClick={handleExportLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export Logs (CSV)
            </Button>
          </div>
        </MotionItem>

        {/* Security Alerts */}
        {securityEvents && securityEvents.length > 0 && (
          <MotionItem>
            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {securityEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <div>
                          <p className="font-medium">{event.event_type}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {event.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.created_at), 'dd MMM, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionItem>
        )}

        {/* Stats */}
        <MotionItem>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Events (Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {auditLogs?.filter(l => 
                    new Date(l.created_at).toDateString() === new Date().toDateString()
                  ).length || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Login Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-info">
                  {auditLogs?.filter(l => l.event_type === 'login').length || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Data Modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">
                  {auditLogs?.filter(l => ['create', 'update', 'delete'].includes(l.event_type)).length || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {auditLogs?.filter(l => l.event_type === 'export').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </MotionItem>

        {/* Filters */}
        <MotionItem>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Trail</CardTitle>
                <div className="flex gap-2">
                  {['all', 'login', 'create', 'update', 'delete', 'export'].map((type) => (
                    <Button
                      key={type}
                      variant={filter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <CardDescription>
                Logs are retained for 180 days as per compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : !auditLogs?.length ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="table-header">Timestamp</TableHead>
                      <TableHead className="table-header">Event</TableHead>
                      <TableHead className="table-header">Entity</TableHead>
                      <TableHead className="table-header">Action</TableHead>
                      <TableHead className="table-header">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('badge-status capitalize', eventTypeStyles[log.event_type])}>
                            {log.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{log.entity_type}</TableCell>
                        <TableCell className="text-muted-foreground">{log.action}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {log.ip_address ? String(log.ip_address) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* CERT-In Incident Response Checklist */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Incident Response Checklist (CERT-In Ready)
              </CardTitle>
              <CardDescription>
                Use this checklist in case of a security incident
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Identify and contain the incident',
                  'Document initial findings with timestamps',
                  'Preserve all relevant logs and evidence',
                  'Notify relevant stakeholders',
                  'Report to CERT-In within 6 hours (if applicable)',
                  'Conduct root cause analysis',
                  'Implement corrective measures',
                  'Document lessons learned',
                  'Update security policies if needed',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
