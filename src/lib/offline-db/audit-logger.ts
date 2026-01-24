// Immutable Audit Logger with Chain Hashing (Tamper-Evident)
import { getDatabase, getDeviceId, getSessionId } from './database';

// Simple hash function for chain integrity
async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface AuditLogEntry {
  actor: string;
  action: 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout' | 'role_change' | 'settings_change';
  entity_type: string;
  entity_id: string;
  before_json?: any;
  after_json?: any;
}

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const db = await getDatabase();
  
  // Get the last log entry for chain hashing
  const lastEntry = await db.audit_logs
    .findOne({ selector: {}, sort: [{ ts: 'desc' }] })
    .exec();
  
  const prevHash = lastEntry?.hash || 'genesis';
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  
  // Create data string for hashing
  const dataForHash = JSON.stringify({
    id,
    ts: now,
    actor: entry.actor,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    prev_hash: prevHash
  });
  
  const hash = await computeHash(dataForHash);
  
  await db.audit_logs.insert({
    id,
    ts: now,
    actor: entry.actor,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    before_json: entry.before_json ? JSON.stringify(entry.before_json) : '',
    after_json: entry.after_json ? JSON.stringify(entry.after_json) : '',
    device_id: getDeviceId(),
    session_id: getSessionId(),
    prev_hash: prevHash,
    hash
  });
}

export async function verifyAuditChain(): Promise<{ valid: boolean; brokenAt?: string }> {
  const db = await getDatabase();
  
  const allLogs = await db.audit_logs
    .find({ selector: {}, sort: [{ ts: 'asc' }] })
    .exec();
  
  let prevHash = 'genesis';
  
  for (const log of allLogs) {
    // Verify prev_hash matches expected
    if (log.prev_hash !== prevHash) {
      return { valid: false, brokenAt: log.id };
    }
    
    // Recompute hash to verify integrity
    const dataForHash = JSON.stringify({
      id: log.id,
      ts: log.ts,
      actor: log.actor,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      prev_hash: log.prev_hash
    });
    
    const computedHash = await computeHash(dataForHash);
    if (computedHash !== log.hash) {
      return { valid: false, brokenAt: log.id };
    }
    
    prevHash = log.hash;
  }
  
  return { valid: true };
}

export async function getAuditLogs(filters?: {
  action?: string;
  entity_type?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}): Promise<any[]> {
  const db = await getDatabase();
  
  let selector: any = {};
  
  if (filters?.action) {
    selector.action = filters.action;
  }
  if (filters?.entity_type) {
    selector.entity_type = filters.entity_type;
  }
  
  const logs = await db.audit_logs
    .find({ selector, sort: [{ ts: 'desc' }], limit: filters?.limit || 100 })
    .exec();
  
  return logs.map((log: any) => log.toJSON());
}

export async function exportAuditLogsCSV(): Promise<string> {
  const logs = await getAuditLogs({ limit: 10000 });
  
  const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Device ID', 'Session ID'];
  const rows = logs.map(log => [
    log.id,
    log.ts,
    log.actor,
    log.action,
    log.entity_type,
    log.entity_id,
    log.device_id,
    log.session_id
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}
