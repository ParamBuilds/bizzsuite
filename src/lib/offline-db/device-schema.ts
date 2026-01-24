// Device and App State Schemas for Phase 3.2
import { RxJsonSchema } from 'rxdb';

export const deviceSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    device_name: { type: 'string' },
    device_fingerprint: { type: 'string' },
    activated_at: { type: 'string' },
    last_seen_at: { type: 'string' },
    is_current: { type: 'boolean' },
    is_active: { type: 'boolean' },
    deactivated_at: { type: ['string', 'null'] },
    deactivation_reason: { type: ['string', 'null'] }
  },
  required: ['id', 'device_fingerprint']
};

export const appStateSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'key',
  type: 'object',
  properties: {
    key: { type: 'string', maxLength: 100 },
    value: { type: 'string' },
    updated_at: { type: 'string' }
  },
  required: ['key', 'value']
};

// Clock verification data for tamper detection
export const clockVerificationSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    last_verified_at: { type: 'string' },
    monotonic_counter: { type: 'number' },
    usage_counter: { type: 'number' },
    last_known_time: { type: 'string' },
    warning_shown: { type: 'boolean' },
    grace_mode_until: { type: ['string', 'null'] }
  },
  required: ['id', 'last_verified_at', 'monotonic_counter']
};

// Backup metadata
export const backupMetadataSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    backup_date: { type: 'string' },
    backup_type: { type: 'string' }, // 'full', 'partial'
    file_name: { type: 'string' },
    size_bytes: { type: 'number' },
    collections_included: { type: 'string' }, // JSON array
    integrity_hash: { type: 'string' },
    restored_at: { type: ['string', 'null'] },
    notes: { type: 'string' }
  },
  required: ['id', 'backup_date', 'backup_type']
};
