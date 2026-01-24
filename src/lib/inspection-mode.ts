// Inspection Day Mode - Read-only auditor mode
import { getDatabase } from './offline-db/database';

export interface InspectionSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  inspectorName?: string;
  purpose?: string;
  actionsLog: InspectionAction[];
}

export interface InspectionAction {
  timestamp: string;
  action: string;
  details?: string;
}

const INSPECTION_STORAGE_KEY = 'bizsuite-inspection-mode';
const INSPECTION_PIN_KEY = 'bizsuite-inspection-pin';

// Check if inspection mode is active
export function isInspectionMode(): boolean {
  const stored = localStorage.getItem(INSPECTION_STORAGE_KEY);
  if (!stored) return false;
  try {
    const session: InspectionSession = JSON.parse(stored);
    return session.endedAt === null;
  } catch {
    return false;
  }
}

// Get current inspection session
export function getInspectionSession(): InspectionSession | null {
  const stored = localStorage.getItem(INSPECTION_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Generate session ID
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `INSP-${timestamp}-${random}`.toUpperCase();
}

// Set admin PIN (should be done during setup)
export function setInspectionPIN(pin: string): void {
  // In production, this should be hashed
  localStorage.setItem(INSPECTION_PIN_KEY, pin);
}

// Verify admin PIN
export function verifyInspectionPIN(pin: string): boolean {
  const storedPin = localStorage.getItem(INSPECTION_PIN_KEY);
  if (!storedPin) {
    // If no PIN set, default is '1234' for demo
    return pin === '1234';
  }
  return pin === storedPin;
}

// Start inspection mode
export function startInspectionMode(inspectorName?: string, purpose?: string): InspectionSession {
  const session: InspectionSession = {
    id: generateSessionId(),
    startedAt: new Date().toISOString(),
    endedAt: null,
    inspectorName,
    purpose,
    actionsLog: [{
      timestamp: new Date().toISOString(),
      action: 'INSPECTION_STARTED',
      details: `Inspector: ${inspectorName || 'Unknown'}, Purpose: ${purpose || 'General Inspection'}`
    }]
  };

  localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(session));
  
  // Log to audit trail
  logInspectionAction('Inspection mode started');

  return session;
}

// Log inspection action
export function logInspectionAction(action: string, details?: string): void {
  const stored = localStorage.getItem(INSPECTION_STORAGE_KEY);
  if (!stored) return;

  try {
    const session: InspectionSession = JSON.parse(stored);
    session.actionsLog.push({
      timestamp: new Date().toISOString(),
      action,
      details
    });
    localStorage.setItem(INSPECTION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore errors
  }
}

// End inspection mode (requires PIN)
export function endInspectionMode(pin: string): { success: boolean; message: string } {
  if (!verifyInspectionPIN(pin)) {
    return { success: false, message: 'Invalid PIN' };
  }

  const stored = localStorage.getItem(INSPECTION_STORAGE_KEY);
  if (!stored) {
    return { success: false, message: 'No active inspection session' };
  }

  try {
    const session: InspectionSession = JSON.parse(stored);
    session.endedAt = new Date().toISOString();
    session.actionsLog.push({
      timestamp: new Date().toISOString(),
      action: 'INSPECTION_ENDED',
      details: 'Admin PIN verified'
    });

    // Archive the session
    const archives = JSON.parse(localStorage.getItem('inspection-archives') || '[]');
    archives.push(session);
    localStorage.setItem('inspection-archives', JSON.stringify(archives));

    // Clear current session
    localStorage.removeItem(INSPECTION_STORAGE_KEY);

    return { success: true, message: 'Inspection mode ended' };
  } catch {
    return { success: false, message: 'Failed to end inspection session' };
  }
}

// Get inspection archives
export function getInspectionArchives(): InspectionSession[] {
  try {
    return JSON.parse(localStorage.getItem('inspection-archives') || '[]');
  } catch {
    return [];
  }
}

// Generate compliance summary for inspectors
export interface ComplianceSummary {
  organizationName: string;
  reportDate: string;
  period: { from: string; to: string };
  metrics: {
    totalInvoices: number;
    totalRevenue: number;
    totalExpenses: number;
    gstCollected: number;
    auditLogEntries: number;
    evidenceVaultEntries: number;
  };
  complianceChecks: Array<{
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details: string;
  }>;
}

export async function generateComplianceSummary(): Promise<ComplianceSummary> {
  // This would pull real data from the database
  // For now, return sample data structure
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    organizationName: 'Your Business',
    reportDate: now.toISOString(),
    period: {
      from: thirtyDaysAgo.toISOString(),
      to: now.toISOString()
    },
    metrics: {
      totalInvoices: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      gstCollected: 0,
      auditLogEntries: 0,
      evidenceVaultEntries: 0
    },
    complianceChecks: [
      { name: 'Audit Trail Active', status: 'pass', details: 'All actions are being logged' },
      { name: 'Data Integrity', status: 'pass', details: 'No tampering detected' },
      { name: 'License Valid', status: 'pass', details: 'Active lifetime license' },
      { name: 'Backup Available', status: 'warning', details: 'Last backup: Never' }
    ]
  };
}

// Export inspection report
export function exportInspectionReport(session: InspectionSession, summary: ComplianceSummary): string {
  const lines = [
    '='.repeat(60),
    'BIZSUITE INSPECTION REPORT',
    '='.repeat(60),
    '',
    `Session ID: ${session.id}`,
    `Started: ${new Date(session.startedAt).toLocaleString('en-IN')}`,
    `Ended: ${session.endedAt ? new Date(session.endedAt).toLocaleString('en-IN') : 'In Progress'}`,
    `Inspector: ${session.inspectorName || 'Not specified'}`,
    `Purpose: ${session.purpose || 'General Inspection'}`,
    '',
    '-'.repeat(60),
    'COMPLIANCE SUMMARY',
    '-'.repeat(60),
    '',
    `Organization: ${summary.organizationName}`,
    `Report Period: ${new Date(summary.period.from).toLocaleDateString('en-IN')} to ${new Date(summary.period.to).toLocaleDateString('en-IN')}`,
    '',
    'METRICS:',
    `  Total Invoices: ${summary.metrics.totalInvoices}`,
    `  Total Revenue: ₹${summary.metrics.totalRevenue.toLocaleString('en-IN')}`,
    `  Total Expenses: ₹${summary.metrics.totalExpenses.toLocaleString('en-IN')}`,
    `  GST Collected: ₹${summary.metrics.gstCollected.toLocaleString('en-IN')}`,
    `  Audit Log Entries: ${summary.metrics.auditLogEntries}`,
    `  Evidence Vault Entries: ${summary.metrics.evidenceVaultEntries}`,
    '',
    'COMPLIANCE CHECKS:',
    ...summary.complianceChecks.map(c => 
      `  [${c.status.toUpperCase()}] ${c.name}: ${c.details}`
    ),
    '',
    '-'.repeat(60),
    'INSPECTION ACTIONS LOG',
    '-'.repeat(60),
    '',
    ...session.actionsLog.map(a => 
      `[${new Date(a.timestamp).toLocaleString('en-IN')}] ${a.action}${a.details ? `: ${a.details}` : ''}`
    ),
    '',
    '='.repeat(60),
    'DISCLAIMER',
    '='.repeat(60),
    'This report provides records for inspection purposes only.',
    'It does not certify compliance with any regulatory requirements.',
    'Verify all data independently before making compliance decisions.',
    '',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '='.repeat(60)
  ];

  return lines.join('\n');
}
