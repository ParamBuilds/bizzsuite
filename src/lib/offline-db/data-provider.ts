// Data Provider Abstraction Layer - Supports Offline & Online modes
import { getDatabase } from './database';
import { writeAuditLog } from './audit-logger';
import { supabase } from '@/integrations/supabase/client';

export type DataMode = 'offline' | 'online' | 'hybrid';

class DataProvider {
  private mode: DataMode = 'offline';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setMode(mode: DataMode) {
    this.mode = mode;
    localStorage.setItem('bizsuite_data_mode', mode);
  }

  getMode(): DataMode {
    return this.mode;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Generic CRUD operations with audit logging

  async create<T extends { id?: string }>(
    collection: string,
    data: T,
    actor: string = 'local-admin'
  ): Promise<T> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    const record = {
      ...data,
      id: data.id || crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
      _synced: false,
      _sync_error: null
    };

    const col = (db as any)[collection];
    if (col) {
      await col.insert(record);
    }

    // Write audit log
    await writeAuditLog({
      actor,
      action: 'create',
      entity_type: collection,
      entity_id: record.id as string,
      after_json: record
    });

    return record as T;
  }

  async update<T extends { id: string }>(
    collection: string,
    id: string,
    updates: Partial<T>,
    actor: string = 'local-admin'
  ): Promise<T | null> {
    const db = await getDatabase();
    const col = (db as any)[collection];
    if (!col) return null;
    
    const existing = await col.findOne({ selector: { id } }).exec();
    if (!existing) return null;

    const before = existing.toJSON();
    const now = new Date().toISOString();
    
    await existing.patch({
      ...updates,
      updated_at: now,
      _synced: false
    });

    const after = existing.toJSON();

    // Write audit log
    await writeAuditLog({
      actor,
      action: 'update',
      entity_type: collection,
      entity_id: id,
      before_json: before,
      after_json: after
    });

    return after;
  }

  async softDelete(
    collection: string,
    id: string,
    actor: string = 'local-admin'
  ): Promise<boolean> {
    const db = await getDatabase();
    const col = (db as any)[collection];
    if (!col) return false;
    
    const existing = await col.findOne({ selector: { id } }).exec();
    if (!existing) return false;

    const before = existing.toJSON();
    const now = new Date().toISOString();
    
    await existing.patch({
      deleted_at: now,
      updated_at: now,
      _synced: false
    });

    // Write audit log
    await writeAuditLog({
      actor,
      action: 'delete',
      entity_type: collection,
      entity_id: id,
      before_json: before
    });

    return true;
  }

  async findOne<T>(collection: string, id: string): Promise<T | null> {
    const db = await getDatabase();
    const col = (db as any)[collection];
    if (!col) return null;
    const doc = await col.findOne({ selector: { id } }).exec();
    return doc ? doc.toJSON() : null;
  }

  async findMany<T>(
    collection: string,
    filter?: { [key: string]: any },
    options?: { limit?: number; skip?: number; sort?: { [key: string]: 'asc' | 'desc' } }
  ): Promise<T[]> {
    const db = await getDatabase();
    const col = (db as any)[collection];
    if (!col) return [];
    
    // Exclude soft-deleted records by default
    const selector = {
      ...filter,
      deleted_at: { $eq: null }
    };
    
    let query = col.find({ selector });
    
    if (options?.sort) {
      const sortArray = Object.entries(options.sort).map(([key, dir]) => ({ [key]: dir }));
      query = query.sort(sortArray);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    
    const docs = await query.exec();
    return docs.map((doc: any) => doc.toJSON());
  }

  // Sync operations (when online)
  async syncToCloud(): Promise<{ success: boolean; synced: number; errors: string[] }> {
    if (!this.isOnline) {
      return { success: false, synced: 0, errors: ['Device is offline'] };
    }

    const db = await getDatabase();
    const collections = ['customers', 'invoices', 'products', 'expenses'];
    let synced = 0;
    const errors: string[] = [];

    for (const collection of collections) {
      const col = (db as any)[collection];
      if (!col) continue;
      
      const unsynced = await col
        .find({ selector: { _synced: false } })
        .exec();

      for (const doc of unsynced) {
        try {
          const data = doc.toJSON();
          delete data._synced;
          delete data._sync_error;
          
          // Mark as synced locally (actual cloud sync would happen here)
          await doc.patch({ _synced: true, _sync_error: null });
          synced++;
        } catch (err: any) {
          errors.push(`${collection}: ${err.message}`);
        }
      }
    }

    return { success: errors.length === 0, synced, errors };
  }

  async pullFromCloud(): Promise<{ success: boolean; pulled: number; conflicts: number }> {
    if (!this.isOnline) {
      return { success: false, pulled: 0, conflicts: 0 };
    }

    // Implementation would pull from Supabase and handle conflicts
    // For now, return placeholder
    return { success: true, pulled: 0, conflicts: 0 };
  }
}

export const dataProvider = new DataProvider();
