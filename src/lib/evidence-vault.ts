// Immutable Evidence Vault - Write-once tamper-evident storage
import { getDatabase } from './offline-db/database';

export interface EvidenceEntry {
  id: string;
  type: 'invoice' | 'compliance_pack' | 'audit_export' | 'inspection_snapshot' | 'backup' | 'other';
  title: string;
  description: string;
  hash: string;
  timestamp: string;
  origin: string;
  linkedAuditIds: string[];
  metadata: Record<string, any>;
  data?: string; // Base64 encoded for small data, or reference URL
  verified?: boolean;
  verifiedAt?: string;
}

// Calculate SHA-256 hash of data
export async function calculateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique evidence ID
function generateEvidenceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EVD-${timestamp}-${random}`.toUpperCase();
}

// Add evidence to vault (write-once)
export async function addEvidence(entry: Omit<EvidenceEntry, 'id' | 'hash' | 'timestamp' | 'verified'>): Promise<EvidenceEntry> {
  const db = await getDatabase();
  
  const id = generateEvidenceId();
  const timestamp = new Date().toISOString();
  
  // Create hash from content
  const contentToHash = JSON.stringify({
    type: entry.type,
    title: entry.title,
    description: entry.description,
    origin: entry.origin,
    linkedAuditIds: entry.linkedAuditIds,
    metadata: entry.metadata,
    data: entry.data,
    timestamp
  });
  
  const hash = await calculateHash(contentToHash);
  
  const fullEntry: EvidenceEntry = {
    ...entry,
    id,
    hash,
    timestamp,
    verified: true,
    verifiedAt: timestamp
  };

  // Store in RxDB
  await db.evidence_vault.insert({
    id,
    type: fullEntry.type,
    title: fullEntry.title,
    description: fullEntry.description,
    hash: fullEntry.hash,
    timestamp: fullEntry.timestamp,
    origin: fullEntry.origin,
    linked_audit_ids: JSON.stringify(fullEntry.linkedAuditIds),
    metadata: JSON.stringify(fullEntry.metadata),
    data: fullEntry.data || null,
    verified: true,
    verified_at: fullEntry.verifiedAt
  });

  return fullEntry;
}

// Get all evidence entries
export async function getAllEvidence(): Promise<EvidenceEntry[]> {
  const db = await getDatabase();
  const entries = await db.evidence_vault.find().exec();
  
  return entries.map((doc: any) => {
    const data = doc.toJSON();
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      hash: data.hash,
      timestamp: data.timestamp,
      origin: data.origin,
      linkedAuditIds: JSON.parse(data.linked_audit_ids || '[]'),
      metadata: JSON.parse(data.metadata || '{}'),
      data: data.data,
      verified: data.verified,
      verifiedAt: data.verified_at
    };
  });
}

// Verify evidence integrity
export async function verifyEvidence(entry: EvidenceEntry): Promise<{ valid: boolean; message: string }> {
  const contentToHash = JSON.stringify({
    type: entry.type,
    title: entry.title,
    description: entry.description,
    origin: entry.origin,
    linkedAuditIds: entry.linkedAuditIds,
    metadata: entry.metadata,
    data: entry.data,
    timestamp: entry.timestamp
  });
  
  const calculatedHash = await calculateHash(contentToHash);
  
  if (calculatedHash === entry.hash) {
    return { valid: true, message: 'Evidence integrity verified - no tampering detected' };
  } else {
    return { valid: false, message: 'INTEGRITY FAILURE - Evidence may have been tampered with' };
  }
}

// Verify entire vault
export async function verifyVaultIntegrity(): Promise<{
  total: number;
  valid: number;
  invalid: number;
  entries: Array<{ id: string; title: string; valid: boolean }>;
}> {
  const entries = await getAllEvidence();
  const results = await Promise.all(
    entries.map(async (entry) => {
      const verification = await verifyEvidence(entry);
      return { id: entry.id, title: entry.title, valid: verification.valid };
    })
  );

  return {
    total: results.length,
    valid: results.filter(r => r.valid).length,
    invalid: results.filter(r => !r.valid).length,
    entries: results
  };
}

// Export vault metadata to CSV
export function exportVaultMetadata(entries: EvidenceEntry[]): string {
  const headers = ['ID', 'Type', 'Title', 'Timestamp', 'Hash', 'Origin', 'Verified'];
  const rows = entries.map(e => [
    e.id,
    e.type,
    `"${e.title.replace(/"/g, '""')}"`,
    e.timestamp,
    e.hash,
    e.origin,
    e.verified ? 'Yes' : 'No'
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Download vault as CSV
export function downloadVaultCSV(entries: EvidenceEntry[]): void {
  const csv = exportVaultMetadata(entries);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bizsuite-evidence-vault-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Add invoice to evidence vault
export async function preserveInvoice(invoice: any): Promise<EvidenceEntry> {
  return addEvidence({
    type: 'invoice',
    title: `Invoice ${invoice.invoice_number}`,
    description: `Invoice for ${invoice.customer_name || 'Customer'} - ₹${invoice.total_amount}`,
    origin: 'Invoice Module',
    linkedAuditIds: [],
    metadata: {
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      totalAmount: invoice.total_amount,
      status: invoice.status,
      issueDate: invoice.issue_date
    },
    data: JSON.stringify(invoice)
  });
}

// Add audit export to evidence vault
export async function preserveAuditExport(auditData: any[], exportName: string): Promise<EvidenceEntry> {
  return addEvidence({
    type: 'audit_export',
    title: exportName,
    description: `Audit log export containing ${auditData.length} entries`,
    origin: 'Audit Module',
    linkedAuditIds: auditData.map(a => a.id).slice(0, 100), // Limit linked IDs
    metadata: {
      entryCount: auditData.length,
      exportedAt: new Date().toISOString()
    },
    data: JSON.stringify(auditData)
  });
}
