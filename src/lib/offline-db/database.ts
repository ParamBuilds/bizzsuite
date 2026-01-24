// RxDB Database initialization for offline-first
import { createRxDatabase, RxDatabase, addRxPlugin, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import {
  customerSchema,
  invoiceSchema,
  productSchema,
  expenseSchema,
  auditLogSchema,
  notificationQueueSchema,
  subscriptionSchema,
  settingsSchema,
  syncConflictSchema
} from './schemas';

// Add RxDB plugins
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

let dbPromise: Promise<RxDatabase> | null = null;

export type OfflineDatabase = RxDatabase & {
  customers: RxCollection;
  invoices: RxCollection;
  products: RxCollection;
  expenses: RxCollection;
  audit_logs: RxCollection;
  notification_queue: RxCollection;
  subscription: RxCollection;
  settings: RxCollection;
  sync_conflicts: RxCollection;
};

export async function getDatabase(): Promise<OfflineDatabase> {
  if (dbPromise) {
    return dbPromise as Promise<OfflineDatabase>;
  }

  dbPromise = createRxDatabase({
    name: 'bizsuite_offline',
    storage: getRxStorageDexie(),
    multiInstance: true,
    eventReduce: true
  }).then(async (db) => {
    await db.addCollections({
      customers: {
        schema: customerSchema
      },
      invoices: {
        schema: invoiceSchema
      },
      products: {
        schema: productSchema
      },
      expenses: {
        schema: expenseSchema
      },
      audit_logs: {
        schema: auditLogSchema
      },
      notification_queue: {
        schema: notificationQueueSchema
      },
      subscription: {
        schema: subscriptionSchema
      },
      settings: {
        schema: settingsSchema
      },
      sync_conflicts: {
        schema: syncConflictSchema
      }
    });

    // Initialize subscription if not exists
    const existingSub = await (db as any).subscription.findOne().exec();
    if (!existingSub) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      await (db as any).subscription.insert({
        id: 'main_subscription',
        status: 'trial',
        plan: 'business',
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        license_key: null,
        activated_at: null,
        expires_at: null
      });
    }

    // Initialize default settings
    const offlineMode = await (db as any).settings.findOne({ selector: { key: 'offline_mode' } }).exec();
    if (!offlineMode) {
      await (db as any).settings.insert({
        key: 'offline_mode',
        value: 'true',
        updated_at: new Date().toISOString()
      });
    }

    return db as unknown as OfflineDatabase;
  });

  return dbPromise as Promise<OfflineDatabase>;
}

// Generate device ID for audit tracking
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('bizsuite_device_id');
  if (!deviceId) {
    deviceId = 'device_' + crypto.randomUUID();
    localStorage.setItem('bizsuite_device_id', deviceId);
  }
  return deviceId;
}

// Generate session ID
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('bizsuite_session_id');
  if (!sessionId) {
    sessionId = 'session_' + crypto.randomUUID();
    sessionStorage.setItem('bizsuite_session_id', sessionId);
  }
  return sessionId;
}
