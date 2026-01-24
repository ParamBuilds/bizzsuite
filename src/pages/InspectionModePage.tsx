import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  ClipboardCheck, 
  Lock, 
  Unlock,
  FileText,
  Shield,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { 
  isInspectionMode,
  getInspectionSession,
  startInspectionMode,
  endInspectionMode,
  logInspectionAction,
  generateComplianceSummary,
  exportInspectionReport,
  InspectionSession,
  ComplianceSummary
} from '@/lib/inspection-mode';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';
import { format } from 'date-fns';

export default function InspectionModePage() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [inspectorName, setInspectorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [exitPin, setExitPin] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    checkInspectionStatus();
  }, []);

  const checkInspectionStatus = async () => {
    const active = isInspectionMode();
    setIsActive(active);
    
    if (active) {
      const currentSession = getInspectionSession();
      setSession(currentSession);
      const complianceSummary = await generateComplianceSummary();
      setSummary(complianceSummary);
    }
  };

  const handleStartInspection = async () => {
    const newSession = startInspectionMode(inspectorName || 'Unknown', purpose || 'General Inspection');
    setSession(newSession);
    setIsActive(true);
    
    const complianceSummary = await generateComplianceSummary();
    setSummary(complianceSummary);
    
    toast.success('Inspection Mode activated');
    setInspectorName('');
    setPurpose('');
  };

  const handleEndInspection = () => {
    const result = endInspectionMode(exitPin);
    
    if (result.success) {
      setIsActive(false);
      setSession(null);
      setSummary(null);
      setShowExitDialog(false);
      setExitPin('');
      toast.success('Inspection Mode ended');
    } else {
      toast.error(result.message);
    }
  };

  const handleExportReport = () => {
    if (!session || !summary) return;
    
    const report = exportInspectionReport(session, summary);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inspection-report-${session.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logInspectionAction('REPORT_EXPORTED');
    toast.success('Inspection report exported');
  };

  const handleNavigate = (path: string) => {
    logInspectionAction('NAVIGATION', `Viewed: ${path}`);
    navigate(path);
  };

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header flex items-center gap-2">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                Inspection Mode
              </h1>
              <p className="page-description">
                Read-only auditor access for compliance inspections
              </p>
            </div>
            {isActive && (
              <Badge variant="destructive" className="animate-pulse">
                <Lock className="mr-1 h-3 w-3" />
                INSPECTION MODE ACTIVE
              </Badge>
            )}
          </div>
        </MotionItem>

        {/* Active Inspection Banner */}
        {isActive && session && (
          <MotionItem>
            <Alert className="border-warning/50 bg-warning/5">
              <Lock className="h-4 w-4" />
              <AlertTitle>Inspection Mode Active</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  The application is in read-only mode. No data can be modified during inspection.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>Session: <strong>{session.id}</strong></span>
                  <span>Started: <strong>{format(new Date(session.startedAt), 'PPp')}</strong></span>
                  {session.inspectorName && <span>Inspector: <strong>{session.inspectorName}</strong></span>}
                </div>
              </AlertDescription>
            </Alert>
          </MotionItem>
        )}

        {!isActive ? (
          /* Start Inspection Form */
          <MotionItem>
            <Card>
              <CardHeader>
                <CardTitle>Enter Inspection Mode</CardTitle>
                <CardDescription>
                  Activate read-only mode for auditors and inspectors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="inspector-name">Inspector Name (Optional)</Label>
                    <Input
                      id="inspector-name"
                      placeholder="Enter inspector name"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Inspection Purpose (Optional)</Label>
                    <Input
                      id="purpose"
                      placeholder="e.g., Annual GST Audit"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    What happens in Inspection Mode:
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>All data becomes read-only</li>
                    <li>Create, edit, and delete actions are disabled</li>
                    <li>All inspector actions are logged</li>
                    <li>Admin PIN required to exit</li>
                  </ul>
                </div>

                <Button onClick={handleStartInspection} className="w-full" size="lg">
                  <Lock className="mr-2 h-5 w-5" />
                  Enter Inspection Mode
                </Button>
              </CardContent>
            </Card>
          </MotionItem>
        ) : (
          <>
            {/* Compliance Summary */}
            {summary && (
              <MotionItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Compliance Summary
                    </CardTitle>
                    <CardDescription>
                      Period: {format(new Date(summary.period.from), 'PP')} to {format(new Date(summary.period.to), 'PP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{summary.metrics.totalInvoices}</p>
                        <p className="text-sm text-muted-foreground">Total Invoices</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">₹{summary.metrics.totalRevenue.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">₹{summary.metrics.gstCollected.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">GST Collected</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">₹{summary.metrics.totalExpenses.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{summary.metrics.auditLogEntries}</p>
                        <p className="text-sm text-muted-foreground">Audit Entries</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">{summary.metrics.evidenceVaultEntries}</p>
                        <p className="text-sm text-muted-foreground">Evidence Items</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Compliance Checks */}
                    <div>
                      <h4 className="font-medium mb-3">Compliance Checks</h4>
                      <div className="space-y-2">
                        {summary.complianceChecks.map((check, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              {check.status === 'pass' && <CheckCircle2 className="h-5 w-5 text-success" />}
                              {check.status === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
                              {check.status === 'fail' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                              <span>{check.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{check.details}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MotionItem>
            )}

            {/* Quick Access */}
            <MotionItem>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Inspector Quick Access
                  </CardTitle>
                  <CardDescription>
                    View records (read-only during inspection)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" onClick={() => handleNavigate('/invoices')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Invoices
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate('/audit-logs')}>
                      <Clock className="mr-2 h-4 w-4" />
                      Audit Logs
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate('/evidence-vault')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Evidence Vault
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate('/reports')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>

            {/* Actions */}
            <MotionItem>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleExportReport} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export Inspection Report
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowExitDialog(true)}
                  className="flex-1"
                >
                  <Unlock className="mr-2 h-4 w-4" />
                  Exit Inspection Mode
                </Button>
              </div>
            </MotionItem>

            {/* Exit Dialog */}
            <AnimatePresence>
              {showExitDialog && (
                <MotionItem>
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle>Exit Inspection Mode</CardTitle>
                      <CardDescription>Enter admin PIN to exit read-only mode</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="exit-pin">Admin PIN</Label>
                        <Input
                          id="exit-pin"
                          type="password"
                          placeholder="Enter PIN"
                          value={exitPin}
                          onChange={(e) => setExitPin(e.target.value)}
                          maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default PIN: 1234 (change in settings)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleEndInspection} className="flex-1">
                          Confirm Exit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </MotionItem>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Disclaimer */}
        <MotionItem>
          <Card className="border-dashed">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Inspection Mode Disclaimer</p>
                  <p>
                    Inspection Mode provides access to business records for review purposes. 
                    This system does not certify compliance with any regulatory requirements. 
                    All inspection activities are logged for audit purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionItem>
      </MotionContainer>
    </PageWrapper>
  );
}
