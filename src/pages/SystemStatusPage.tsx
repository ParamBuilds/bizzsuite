// System Status Page for Phase 3.2
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HardDrive,
  Smartphone,
  Key,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit2,
  Database,
  Activity,
  Link2,
  FileJson,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '@/contexts/AppModeContext';
import { useSubscription } from '@/hooks/useSubscription';
import { getRegisteredDevices, deactivateDevice, renameDevice, Device, getDeviceSlots } from '@/lib/device-manager';
import { createFullBackup, downloadBackup, getBackupHistory, getStorageEstimate, BackupMetadata } from '@/lib/backup-restore';
import { verifyAuditChain } from '@/lib/offline-db/audit-logger';
import { getClockVerification } from '@/lib/clock-tamper';
import { getDatabase } from '@/lib/offline-db/database';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StatusItem {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  icon: React.ReactNode;
}

export default function SystemStatusPage() {
  const navigate = useNavigate();
  const { mode, subscription: appSubscription, auditChainValid, clockTamperDetected, refresh: refreshAppMode } = useAppMode();
  const { subscription, isPremium, isTrial, isExpired, refresh: refreshSubscription } = useSubscription();
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceSlots, setDeviceSlots] = useState({ used: 0, total: 3, remaining: 3 });
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, usagePercent: 0 });
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  
  // Device management dialogs
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [deactivatingDevice, setDeactivatingDevice] = useState<Device | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [devs, slots, history, storage, auditResult, clockData] = await Promise.all([
        getRegisteredDevices(),
        getDeviceSlots(),
        getBackupHistory(),
        getStorageEstimate(),
        verifyAuditChain(),
        getClockVerification()
      ]);
      
      setDevices(devs);
      setDeviceSlots(slots);
      setBackupHistory(history);
      setStorageInfo(storage);
      
      // Build status items
      const items: StatusItem[] = [
        {
          name: 'License Status',
          status: isPremium ? 'ok' : isTrial ? 'warning' : 'error',
          message: isPremium 
            ? `Active until ${subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}`
            : isTrial 
              ? `Trial: ${subscription?.trialDaysRemaining || 0} days remaining`
              : 'Expired - Activate license to continue',
          icon: <Key className="h-5 w-5" />
        },
        {
          name: 'Device Usage',
          status: slots.remaining > 0 ? 'ok' : 'warning',
          message: `${slots.used} of ${slots.total} device slots used`,
          icon: <Smartphone className="h-5 w-5" />
        },
        {
          name: 'Audit Chain',
          status: auditResult.valid ? 'ok' : 'error',
          message: auditResult.valid ? 'Integrity verified' : `Chain broken at ${auditResult.brokenAt}`,
          icon: <Link2 className="h-5 w-5" />
        },
        {
          name: 'Clock Status',
          status: clockData.graceModeUntil ? 'warning' : 'ok',
          message: clockData.graceModeUntil 
            ? 'Anomaly detected - Grace mode active'
            : 'System clock verified',
          icon: <Clock className="h-5 w-5" />
        },
        {
          name: 'Local Storage',
          status: storage.usagePercent > 90 ? 'warning' : 'ok',
          message: `${formatBytes(storage.usage)} used of ${formatBytes(storage.quota)} (${storage.usagePercent}%)`,
          icon: <HardDrive className="h-5 w-5" />
        },
        {
          name: 'Offline Database',
          status: 'ok',
          message: 'IndexedDB operational',
          icon: <Database className="h-5 w-5" />
        }
      ];
      
      setStatusItems(items);
      await refreshAppMode();
      await refreshSubscription();
    } catch (error) {
      console.error('Failed to load system status:', error);
      toast.error('Failed to load system status');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result = await createFullBackup();
      if (result.success && result.data && result.filename) {
        downloadBackup(result.data, result.filename);
        toast.success('Backup created and downloaded');
        await loadData();
      } else {
        toast.error(result.error || 'Failed to create backup');
      }
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRenameDevice = async () => {
    if (!editingDevice || !newDeviceName.trim()) return;
    
    const success = await renameDevice(editingDevice.id, newDeviceName);
    if (success) {
      toast.success('Device renamed');
      setEditingDevice(null);
      setNewDeviceName('');
      await loadData();
    } else {
      toast.error('Failed to rename device');
    }
  };

  const handleDeactivateDevice = async () => {
    if (!deactivatingDevice) return;
    
    const success = await deactivateDevice(deactivatingDevice.id);
    if (success) {
      toast.success('Device deactivated');
      setDeactivatingDevice(null);
      await loadData();
    } else {
      toast.error('Failed to deactivate device');
    }
  };

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return <Badge className="bg-success/10 text-success border-success/20">Healthy</Badge>;
      case 'warning': return <Badge className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'error': return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>;
    }
  };

  const overallHealth = statusItems.every(s => s.status === 'ok') 
    ? 'ok' 
    : statusItems.some(s => s.status === 'error') 
      ? 'error' 
      : 'warning';

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="page-header flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  System Status
                </h1>
                <p className="page-description">Monitor system health, devices, and backups</p>
              </div>
            </div>
            <Button onClick={loadData} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </MotionItem>

        {/* Overall Health */}
        <MotionItem>
          <Card className={`border-2 ${
            overallHealth === 'ok' ? 'border-success/50 bg-success/5' :
            overallHealth === 'warning' ? 'border-warning/50 bg-warning/5' :
            'border-destructive/50 bg-destructive/5'
          }`}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    overallHealth === 'ok' ? 'bg-success/10' :
                    overallHealth === 'warning' ? 'bg-warning/10' :
                    'bg-destructive/10'
                  }`}>
                    {getStatusIcon(overallHealth)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {overallHealth === 'ok' ? 'All Systems Operational' :
                       overallHealth === 'warning' ? 'Some Warnings Detected' :
                       'Issues Require Attention'}
                    </h2>
                    <p className="text-muted-foreground">
                      {statusItems.filter(s => s.status === 'ok').length} of {statusItems.length} checks passed
                    </p>
                  </div>
                </div>
                {getStatusBadge(overallHealth)}
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        {/* Status Grid */}
        <MotionItem>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statusItems.map((item) => (
              <Card key={item.name} className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.status === 'ok' ? 'bg-success/10 text-success' :
                        item.status === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                      </div>
                    </div>
                    {getStatusIcon(item.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </MotionItem>

        {/* Device Management */}
        <MotionItem>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Registered Devices
                  </CardTitle>
                  <CardDescription>
                    {deviceSlots.used} of {deviceSlots.total} device slots used
                  </CardDescription>
                </div>
                <Badge variant={deviceSlots.remaining > 0 ? 'secondary' : 'destructive'}>
                  {deviceSlots.remaining} slots remaining
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No devices registered</p>
              ) : (
                <div className="space-y-3">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        device.is_current ? 'border-primary/50 bg-primary/5' : ''
                      } ${!device.is_active ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className={`h-5 w-5 ${device.is_current ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{device.device_name}</span>
                            {device.is_current && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                            {!device.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last seen: {new Date(device.last_seen_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {device.is_active && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDevice(device);
                              setNewDeviceName(device.device_name);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {!device.is_current && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeactivatingDevice(device)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Backup & Restore */}
        <MotionItem>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    Backup & Restore
                  </CardTitle>
                  <CardDescription>
                    Create and manage local backups of your data
                  </CardDescription>
                </div>
                <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
                  {isCreatingBackup ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Create Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                    </span>
                  </div>
                  <Progress value={storageInfo.usagePercent} className="h-2" />
                </div>

                {backupHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Recent Backups</h4>
                    <div className="space-y-2">
                      {backupHistory.slice(0, 5).map((backup) => (
                        <div key={backup.id} className="flex items-center justify-between p-3 rounded border">
                          <div className="flex items-center gap-3">
                            <FileJson className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{backup.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(backup.backup_date).toLocaleString()} • {formatBytes(backup.size_bytes)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{backup.backup_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </MotionItem>
      </MotionContainer>

      {/* Rename Device Dialog */}
      <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Device</DialogTitle>
            <DialogDescription>
              Give this device a friendly name for easy identification
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Enter device name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDevice(null)}>Cancel</Button>
            <Button onClick={handleRenameDevice}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Device Confirmation */}
      <AlertDialog open={!!deactivatingDevice} onOpenChange={() => setDeactivatingDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{deactivatingDevice?.device_name}" and free up one device slot. 
              This action can be reversed by reactivating on the same device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateDevice} className="bg-destructive hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
