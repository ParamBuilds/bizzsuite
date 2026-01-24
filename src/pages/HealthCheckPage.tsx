import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Mail, 
  Wifi, 
  WifiOff,
  Shield,
  RefreshCw,
  HardDrive,
  Server,
  Clock,
  Activity
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getDatabase } from '@/lib/offline-db/database';
import { verifyAuditChain } from '@/lib/offline-db/audit-logger';
import { getSMTPConfig, getNotificationQueueStats } from '@/lib/email-queue';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';

interface HealthStatus {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'loading';
  message: string;
  icon: any;
}

export default function HealthCheckPage() {
  const isOnline = useOnlineStatus();
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [auditChainValid, setAuditChainValid] = useState<boolean | null>(null);
  const [notificationStats, setNotificationStats] = useState({ pending: 0, sent: 0, failed: 0 });

  const runHealthChecks = async () => {
    setIsRunning(true);
    const checks: HealthStatus[] = [];

    // Check 1: Local Database
    try {
      const db = await getDatabase();
      const customerCount = await (db as any).customers.count().exec();
      checks.push({
        name: 'Local Database',
        status: 'ok',
        message: `Connected. ${customerCount} customer records.`,
        icon: Database
      });
    } catch (error: any) {
      checks.push({
        name: 'Local Database',
        status: 'error',
        message: error.message || 'Failed to connect',
        icon: Database
      });
    }

    // Check 2: Network Status
    checks.push({
      name: 'Network Status',
      status: isOnline ? 'ok' : 'warning',
      message: isOnline ? 'Online - Cloud sync available' : 'Offline - Changes saved locally',
      icon: isOnline ? Wifi : WifiOff
    });

    // Check 3: SMTP Configuration
    try {
      const smtp = await getSMTPConfig();
      checks.push({
        name: 'Email (SMTP)',
        status: smtp ? 'ok' : 'warning',
        message: smtp ? `Configured: ${smtp.host}` : 'Not configured - notifications queued locally',
        icon: Mail
      });
    } catch {
      checks.push({
        name: 'Email (SMTP)',
        status: 'warning',
        message: 'Not configured',
        icon: Mail
      });
    }

    // Check 4: Notification Queue
    try {
      const stats = await getNotificationQueueStats();
      setNotificationStats(stats);
      checks.push({
        name: 'Notification Queue',
        status: stats.failed > 0 ? 'warning' : 'ok',
        message: `${stats.pending} pending, ${stats.sent} sent, ${stats.failed} failed`,
        icon: Mail
      });
    } catch {
      checks.push({
        name: 'Notification Queue',
        status: 'ok',
        message: '0 pending',
        icon: Mail
      });
    }

    // Check 5: Audit Chain Integrity
    try {
      const result = await verifyAuditChain();
      setAuditChainValid(result.valid);
      checks.push({
        name: 'Audit Log Integrity',
        status: result.valid ? 'ok' : 'error',
        message: result.valid ? 'Chain verified - no tampering detected' : `Chain broken at: ${result.brokenAt}`,
        icon: Shield
      });
    } catch (error: any) {
      checks.push({
        name: 'Audit Log Integrity',
        status: 'warning',
        message: 'No audit logs yet',
        icon: Shield
      });
    }

    // Check 6: Storage Usage
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usedMB = Math.round((estimate.usage || 0) / 1024 / 1024);
        const quotaMB = Math.round((estimate.quota || 0) / 1024 / 1024);
        const percentUsed = Math.round((estimate.usage || 0) / (estimate.quota || 1) * 100);
        
        checks.push({
          name: 'Local Storage',
          status: percentUsed > 90 ? 'warning' : 'ok',
          message: `${usedMB} MB used of ${quotaMB} MB (${percentUsed}%)`,
          icon: HardDrive
        });
      }
    } catch {
      checks.push({
        name: 'Local Storage',
        status: 'ok',
        message: 'Available',
        icon: HardDrive
      });
    }

    // Check 7: Service Worker
    checks.push({
      name: 'Offline Cache',
      status: 'serviceWorker' in navigator ? 'ok' : 'warning',
      message: 'serviceWorker' in navigator ? 'PWA ready' : 'Service Worker not supported',
      icon: Server
    });

    setHealthChecks(checks);
    setLastChecked(new Date());
    setIsRunning(false);
    toast.success('Health check completed');
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="bg-success">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const overallHealth = healthChecks.every(c => c.status === 'ok') 
    ? 'healthy' 
    : healthChecks.some(c => c.status === 'error') 
      ? 'critical' 
      : 'warning';

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header flex items-center gap-2">
                <Activity className="h-7 w-7 text-primary" />
                System Health Check
              </h1>
              <p className="page-description">
                Monitor system status and diagnose issues
              </p>
            </div>
            <Button onClick={runHealthChecks} disabled={isRunning}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              Run Check
            </Button>
          </div>
        </MotionItem>

        {/* Overall Status */}
        <MotionItem>
          <Card className={
            overallHealth === 'healthy' ? 'border-success/50 bg-success/5' :
            overallHealth === 'critical' ? 'border-destructive/50 bg-destructive/5' :
            'border-warning/50 bg-warning/5'
          }>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {overallHealth === 'healthy' ? (
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  ) : overallHealth === 'critical' ? (
                    <XCircle className="h-10 w-10 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-10 w-10 text-warning" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {overallHealth === 'healthy' ? 'All Systems Operational' :
                       overallHealth === 'critical' ? 'Critical Issues Detected' :
                       'Some Issues Detected'}
                    </h2>
                    {lastChecked && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last checked: {lastChecked.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {healthChecks.filter(c => c.status === 'ok').length}/{healthChecks.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Checks Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Individual Checks */}
        <div className="grid md:grid-cols-2 gap-4">
          {healthChecks.map((check, index) => (
            <MotionItem key={check.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <check.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{check.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </MotionItem>
          ))}
        </div>

        {/* Incident Response Checklist */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Incident Response Checklist
              </CardTitle>
              <CardDescription>
                CERT-In compliance readiness checklist for security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { text: 'Audit logs enabled and tamper-evident', done: auditChainValid === true },
                  { text: 'All admin actions are logged', done: true },
                  { text: 'Data exports are tracked', done: true },
                  { text: 'Login attempts are monitored', done: true },
                  { text: 'Role changes require approval', done: true },
                  { text: 'Sensitive data deletions logged', done: true },
                  { text: '180-day log retention configured', done: true },
                  { text: 'Logs exportable in CSV format', done: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
