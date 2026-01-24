import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Shield, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Download, 
  RefreshCw,
  Clock,
  FileText,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { 
  getAllEvidence, 
  verifyVaultIntegrity, 
  downloadVaultCSV,
  EvidenceEntry 
} from '@/lib/evidence-vault';
import { MotionContainer, MotionItem, PageWrapper } from '@/components/ui/motion';
import { format } from 'date-fns';

const typeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-4 w-4" />,
  compliance_pack: <Shield className="h-4 w-4" />,
  audit_export: <FileCheck className="h-4 w-4" />,
  inspection_snapshot: <Clock className="h-4 w-4" />,
  backup: <Download className="h-4 w-4" />,
  other: <Lock className="h-4 w-4" />
};

const typeColors: Record<string, string> = {
  invoice: 'bg-blue-500/10 text-blue-600',
  compliance_pack: 'bg-green-500/10 text-green-600',
  audit_export: 'bg-purple-500/10 text-purple-600',
  inspection_snapshot: 'bg-orange-500/10 text-orange-600',
  backup: 'bg-gray-500/10 text-gray-600',
  other: 'bg-muted text-muted-foreground'
};

export default function EvidenceVaultPage() {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    total: number;
    valid: number;
    invalid: number;
  } | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getAllEvidence();
      setEntries(data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Failed to load evidence:', error);
      toast.error('Failed to load evidence vault');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAll = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyVaultIntegrity();
      setVerificationResult(result);
      
      if (result.invalid === 0) {
        toast.success(`All ${result.total} entries verified successfully`);
      } else {
        toast.error(`${result.invalid} entries failed verification!`);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error('No entries to export');
      return;
    }
    downloadVaultCSV(entries);
    toast.success('Evidence vault exported to CSV');
  };

  return (
    <PageWrapper className="space-y-6">
      <MotionContainer>
        <MotionItem>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-header flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Evidence Vault
              </h1>
              <p className="page-description">
                Immutable, tamper-evident storage for critical business records
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleVerifyAll} disabled={isVerifying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />
                Verify Integrity
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </MotionItem>

        {/* Integrity Status */}
        {verificationResult && (
          <MotionItem>
            <Card className={verificationResult.invalid === 0 ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {verificationResult.invalid === 0 ? (
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {verificationResult.invalid === 0 
                          ? 'All Evidence Verified' 
                          : 'Integrity Issues Detected'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {verificationResult.valid} of {verificationResult.total} entries passed verification
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{verificationResult.valid}</p>
                      <p className="text-muted-foreground">Valid</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">{verificationResult.invalid}</p>
                      <p className="text-muted-foreground">Invalid</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionItem>
        )}

        {/* Stats */}
        <MotionItem>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{entries.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {entries.filter(e => e.type === 'invoice').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Invoices</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {entries.filter(e => e.type === 'audit_export').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Audit Exports</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {entries.filter(e => e.verified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </MotionItem>

        {/* Timeline */}
        <MotionItem>
          <Card>
            <CardHeader>
              <CardTitle>Evidence Timeline</CardTitle>
              <CardDescription>
                Chronological view of all preserved evidence (write-once, read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">No evidence in vault yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Evidence is automatically preserved when invoices are finalized, audits exported, etc.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[entry.type]}`}>
                        {typeIcons[entry.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{entry.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {entry.type.replace('_', ' ')}
                          </Badge>
                          {entry.verified && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(entry.timestamp), 'PPp')}</span>
                          <span>Origin: {entry.origin}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <code className="text-xs bg-muted px-2 py-1 rounded block truncate max-w-[120px]">
                          {entry.hash.substring(0, 16)}...
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">SHA-256</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </MotionItem>

        {/* Disclaimer */}
        <MotionItem>
          <Card className="border-dashed">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Evidence Preservation Notice</p>
                  <p>
                    This vault provides tamper-evident storage for business records. 
                    Entries cannot be modified or deleted after creation. 
                    This system aids in record-keeping but does not certify regulatory compliance.
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
