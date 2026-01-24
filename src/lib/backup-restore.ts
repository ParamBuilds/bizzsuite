// Backup & Restore for Phase 3.2
import { getDatabase } from './offline-db/database';
import { writeAuditLog } from './offline-db/audit-logger';

export interface BackupMetadata {
  id: string;
  backup_date: string;
  backup_type: 'full' | 'partial';
  file_name: string;
  size_bytes: number;
  collections_included: string[];
  integrity_hash: string;
  app_version: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  customers: any[];
  invoices: any[];
  products: any[];
  expenses: any[];
  audit_logs: any[];
  subscription: any[];
  settings: any[];
}

const BACKUP_HISTORY_KEY = 'backup_history';
const APP_VERSION = '1.0.0';

// Compute simple hash for integrity
async function computeIntegrityHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Create a full backup
export async function createFullBackup(): Promise<{ 
  success: boolean; 
  data?: Blob; 
  filename?: string;
  error?: string 
}> {
  try {
    const db = await getDatabase();
    const now = new Date();
    const backupId = crypto.randomUUID();
    
    // Collect all data from each collection
    const [customers, invoices, products, expenses, auditLogs, subscription, settings] = await Promise.all([
      db.customers.find().exec(),
      db.invoices.find().exec(),
      db.products.find().exec(),
      db.expenses.find().exec(),
      db.audit_logs.find().exec(),
      db.subscription.find().exec(),
      db.settings.find().exec()
    ]);
    
    const collectionsIncluded = ['customers', 'invoices', 'products', 'expenses', 'audit_logs', 'subscription', 'settings'];
    
    const backupPayload: BackupData = {
      metadata: {
        id: backupId,
        backup_date: now.toISOString(),
        backup_type: 'full',
        file_name: `bizsuite_backup_${now.toISOString().split('T')[0]}.json`,
        size_bytes: 0, // Will be calculated
        collections_included: collectionsIncluded,
        integrity_hash: '', // Will be calculated
        app_version: APP_VERSION
      },
      customers: customers.map(c => c.toJSON()),
      invoices: invoices.map(i => i.toJSON()),
      products: products.map(p => p.toJSON()),
      expenses: expenses.map(e => e.toJSON()),
      audit_logs: auditLogs.map(a => a.toJSON()),
      subscription: subscription.map(s => s.toJSON()),
      settings: settings.map(s => s.toJSON())
    };
    
    // Calculate integrity hash (exclude metadata hash field itself)
    const dataForHash = JSON.stringify({
      customers: backupPayload.customers,
      invoices: backupPayload.invoices,
      products: backupPayload.products,
      expenses: backupPayload.expenses,
      audit_logs: backupPayload.audit_logs,
      subscription: backupPayload.subscription,
      settings: backupPayload.settings
    });
    
    backupPayload.metadata.integrity_hash = await computeIntegrityHash(dataForHash);
    
    const jsonString = JSON.stringify(backupPayload, null, 2);
    backupPayload.metadata.size_bytes = new Blob([jsonString]).size;
    
    // Re-stringify with updated size
    const finalJson = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([finalJson], { type: 'application/json' });
    
    // Save backup to history
    await saveBackupToHistory(backupPayload.metadata);
    
    // Log the backup action
    await writeAuditLog({
      actor: 'system',
      action: 'export',
      entity_type: 'backup',
      entity_id: backupId,
      after_json: backupPayload.metadata
    });
    
    return {
      success: true,
      data: blob,
      filename: backupPayload.metadata.file_name
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Validate backup file
export async function validateBackup(file: File): Promise<{
  valid: boolean;
  metadata?: BackupMetadata;
  error?: string;
}> {
  try {
    const text = await file.text();
    const data: BackupData = JSON.parse(text);
    
    if (!data.metadata || !data.metadata.id || !data.metadata.backup_date) {
      return { valid: false, error: 'Invalid backup format: missing metadata' };
    }
    
    // Verify integrity hash
    const dataForHash = JSON.stringify({
      customers: data.customers,
      invoices: data.invoices,
      products: data.products,
      expenses: data.expenses,
      audit_logs: data.audit_logs,
      subscription: data.subscription,
      settings: data.settings
    });
    
    const computedHash = await computeIntegrityHash(dataForHash);
    
    if (computedHash !== data.metadata.integrity_hash) {
      return { valid: false, error: 'Backup integrity check failed. File may be corrupted.' };
    }
    
    return {
      valid: true,
      metadata: data.metadata
    };
  } catch (error: any) {
    return { valid: false, error: 'Failed to parse backup file: ' + error.message };
  }
}

// Restore from backup
export async function restoreFromBackup(file: File): Promise<{
  success: boolean;
  restored?: {
    customers: number;
    invoices: number;
    products: number;
    expenses: number;
  };
  error?: string;
}> {
  try {
    // First validate
    const validation = await validateBackup(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const text = await file.text();
    const data: BackupData = JSON.parse(text);
    const db = await getDatabase();
    
    // Clear existing data (except subscription/settings)
    // This is a destructive operation - should be confirmed by user
    const collections = ['customers', 'invoices', 'products', 'expenses'];
    
    for (const collName of collections) {
      const coll = (db as any)[collName];
      const docs = await coll.find().exec();
      for (const doc of docs) {
        await doc.remove();
      }
    }
    
    // Restore data
    let restoredCounts = {
      customers: 0,
      invoices: 0,
      products: 0,
      expenses: 0
    };
    
    for (const customer of data.customers || []) {
      delete customer._rev;
      await db.customers.insert(customer);
      restoredCounts.customers++;
    }
    
    for (const invoice of data.invoices || []) {
      delete invoice._rev;
      await db.invoices.insert(invoice);
      restoredCounts.invoices++;
    }
    
    for (const product of data.products || []) {
      delete product._rev;
      await db.products.insert(product);
      restoredCounts.products++;
    }
    
    for (const expense of data.expenses || []) {
      delete expense._rev;
      await db.expenses.insert(expense);
      restoredCounts.expenses++;
    }
    
    // Log restore action
    await writeAuditLog({
      actor: 'system',
      action: 'create',
      entity_type: 'restore',
      entity_id: data.metadata.id,
      after_json: { restored: restoredCounts, from_backup: data.metadata }
    });
    
    return {
      success: true,
      restored: restoredCounts
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get backup history
export async function getBackupHistory(): Promise<BackupMetadata[]> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: BACKUP_HISTORY_KEY } }).exec();
  
  if (!record) return [];
  
  return JSON.parse(record.value);
}

// Save backup to history
async function saveBackupToHistory(metadata: BackupMetadata): Promise<void> {
  const db = await getDatabase();
  const history = await getBackupHistory();
  
  history.unshift(metadata);
  
  // Keep only last 10 backups in history
  const trimmedHistory = history.slice(0, 10);
  
  const record = await db.settings.findOne({ selector: { key: BACKUP_HISTORY_KEY } }).exec();
  const now = new Date().toISOString();
  
  if (record) {
    await record.patch({
      value: JSON.stringify(trimmedHistory),
      updated_at: now
    });
  } else {
    await db.settings.insert({
      key: BACKUP_HISTORY_KEY,
      value: JSON.stringify(trimmedHistory),
      updated_at: now
    });
  }
}

// Download backup file
export function downloadBackup(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Get storage estimate
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usagePercent: estimate.quota ? Math.round((estimate.usage || 0) / estimate.quota * 100) : 0
    };
  }
  return { usage: 0, quota: 0, usagePercent: 0 };
}
