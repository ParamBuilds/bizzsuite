// RxDB Schemas for offline-first database
import { RxJsonSchema } from 'rxdb';

export const customerSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    business_id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    address: { type: 'string' },
    gstin: { type: 'string' },
    notes: { type: 'string' },
    total_spent: { type: 'number' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    deleted_at: { type: ['string', 'null'] },
    _synced: { type: 'boolean' },
    _sync_error: { type: ['string', 'null'] }
  },
  required: ['id', 'name']
};

export const invoiceSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    business_id: { type: 'string' },
    customer_id: { type: ['string', 'null'] },
    invoice_number: { type: 'string' },
    status: { type: 'string' },
    issue_date: { type: 'string' },
    due_date: { type: ['string', 'null'] },
    subtotal: { type: 'number' },
    tax_amount: { type: 'number' },
    total_amount: { type: 'number' },
    notes: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    deleted_at: { type: ['string', 'null'] },
    _synced: { type: 'boolean' },
    _sync_error: { type: ['string', 'null'] }
  },
  required: ['id', 'invoice_number']
};

export const productSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    business_id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    sku: { type: 'string' },
    type: { type: 'string' },
    unit_price: { type: 'number' },
    cost_price: { type: 'number' },
    stock_quantity: { type: 'number' },
    low_stock_threshold: { type: 'number' },
    gst_rate: { type: 'number' },
    hsn_sac_code: { type: 'string' },
    is_active: { type: 'boolean' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    deleted_at: { type: ['string', 'null'] },
    _synced: { type: 'boolean' },
    _sync_error: { type: ['string', 'null'] }
  },
  required: ['id', 'name']
};

export const expenseSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    business_id: { type: 'string' },
    category: { type: 'string' },
    description: { type: 'string' },
    amount: { type: 'number' },
    expense_date: { type: 'string' },
    vendor: { type: 'string' },
    notes: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    deleted_at: { type: ['string', 'null'] },
    _synced: { type: 'boolean' },
    _sync_error: { type: ['string', 'null'] }
  },
  required: ['id', 'description', 'amount']
};

export const auditLogSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    ts: { type: 'string' },
    actor: { type: 'string' },
    action: { type: 'string' },
    entity_type: { type: 'string' },
    entity_id: { type: 'string' },
    before_json: { type: 'string' },
    after_json: { type: 'string' },
    device_id: { type: 'string' },
    session_id: { type: 'string' },
    prev_hash: { type: 'string' },
    hash: { type: 'string' }
  },
  required: ['id', 'ts', 'action', 'entity_type']
};

export const notificationQueueSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    type: { type: 'string' },
    recipient_email: { type: 'string' },
    subject: { type: 'string' },
    body: { type: 'string' },
    status: { type: 'string' }, // pending, sent, failed
    created_at: { type: 'string' },
    sent_at: { type: ['string', 'null'] },
    error: { type: ['string', 'null'] },
    retry_count: { type: 'number' }
  },
  required: ['id', 'type', 'recipient_email']
};

export const subscriptionSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    status: { type: 'string' }, // trial, active, expired
    plan: { type: 'string' }, // business
    trial_start: { type: 'string' },
    trial_end: { type: 'string' },
    license_key: { type: ['string', 'null'] },
    activated_at: { type: ['string', 'null'] },
    expires_at: { type: ['string', 'null'] }
  },
  required: ['id', 'status']
};

export const settingsSchema: RxJsonSchema<any> = {
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

export const syncConflictSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    entity_type: { type: 'string' },
    entity_id: { type: 'string' },
    local_data: { type: 'string' },
    remote_data: { type: 'string' },
    resolved: { type: 'boolean' },
    created_at: { type: 'string' }
  },
  required: ['id', 'entity_type', 'entity_id']
};
