// Device Management for Phase 3.2
import { getDatabase, getDeviceId } from './offline-db/database';
import { writeAuditLog } from './offline-db/audit-logger';

export interface Device {
  id: string;
  device_name: string;
  device_fingerprint: string;
  activated_at: string;
  last_seen_at: string;
  is_current: boolean;
  is_active: boolean;
  deactivated_at: string | null;
  deactivation_reason: string | null;
}

const DEVICES_KEY = 'registered_devices';
const MAX_DEVICES = 3;

// Get browser/device fingerprint
export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform
  ];
  
  // Simple hash of components
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'fp_' + Math.abs(hash).toString(16);
}

// Get device name from user agent
export function getDeviceNameFromUA(): string {
  const ua = navigator.userAgent;
  
  if (/Android/i.test(ua)) return 'Android Device';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux PC';
  
  return 'Unknown Device';
}

// Get all registered devices
export async function getRegisteredDevices(): Promise<Device[]> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: DEVICES_KEY } }).exec();
  
  if (!record) {
    return [];
  }
  
  const devices: Device[] = JSON.parse(record.value);
  
  // Mark current device
  const currentDeviceId = getDeviceId();
  return devices.map(d => ({
    ...d,
    is_current: d.id === currentDeviceId
  }));
}

// Register current device
export async function registerCurrentDevice(customName?: string): Promise<{
  success: boolean;
  message: string;
  device?: Device;
}> {
  const db = await getDatabase();
  const currentDeviceId = getDeviceId();
  const fingerprint = generateDeviceFingerprint();
  
  let devices = await getRegisteredDevices();
  
  // Check if device already registered
  const existingDevice = devices.find(d => d.id === currentDeviceId || d.device_fingerprint === fingerprint);
  if (existingDevice && existingDevice.is_active) {
    // Update last seen
    existingDevice.last_seen_at = new Date().toISOString();
    
    await saveDevices(devices);
    
    return {
      success: true,
      message: 'Device already registered',
      device: existingDevice
    };
  }
  
  // Check device limit
  const activeDevices = devices.filter(d => d.is_active);
  if (activeDevices.length >= MAX_DEVICES) {
    return {
      success: false,
      message: `Device limit reached (${MAX_DEVICES}). Please deactivate another device first.`
    };
  }
  
  // Register new device
  const now = new Date().toISOString();
  const newDevice: Device = {
    id: currentDeviceId,
    device_name: customName || getDeviceNameFromUA(),
    device_fingerprint: fingerprint,
    activated_at: now,
    last_seen_at: now,
    is_current: true,
    is_active: true,
    deactivated_at: null,
    deactivation_reason: null
  };
  
  // If there was an inactive device with same fingerprint, reactivate it
  if (existingDevice && !existingDevice.is_active) {
    existingDevice.is_active = true;
    existingDevice.id = currentDeviceId;
    existingDevice.last_seen_at = now;
    existingDevice.device_name = customName || existingDevice.device_name;
    existingDevice.deactivated_at = null;
    existingDevice.deactivation_reason = null;
    
    await saveDevices(devices);
    
    await writeAuditLog({
      actor: 'system',
      action: 'update',
      entity_type: 'device',
      entity_id: existingDevice.id,
      after_json: existingDevice
    });
    
    return {
      success: true,
      message: 'Device reactivated',
      device: existingDevice
    };
  }
  
  devices.push(newDevice);
  await saveDevices(devices);
  
  await writeAuditLog({
    actor: 'system',
    action: 'create',
    entity_type: 'device',
    entity_id: newDevice.id,
    after_json: newDevice
  });
  
  return {
    success: true,
    message: 'Device registered successfully',
    device: newDevice
  };
}

// Rename a device
export async function renameDevice(deviceId: string, newName: string): Promise<boolean> {
  const devices = await getRegisteredDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) return false;
  
  const oldName = device.device_name;
  device.device_name = newName;
  
  await saveDevices(devices);
  
  await writeAuditLog({
    actor: 'user',
    action: 'update',
    entity_type: 'device',
    entity_id: deviceId,
    before_json: { device_name: oldName },
    after_json: { device_name: newName }
  });
  
  return true;
}

// Deactivate a device
export async function deactivateDevice(deviceId: string, reason?: string): Promise<boolean> {
  const devices = await getRegisteredDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device || !device.is_active) return false;
  
  const now = new Date().toISOString();
  device.is_active = false;
  device.deactivated_at = now;
  device.deactivation_reason = reason || 'User deactivated';
  
  await saveDevices(devices);
  
  await writeAuditLog({
    actor: 'user',
    action: 'update',
    entity_type: 'device',
    entity_id: deviceId,
    before_json: { is_active: true },
    after_json: { is_active: false, deactivated_at: now, deactivation_reason: device.deactivation_reason }
  });
  
  return true;
}

// Get active device count
export async function getActiveDeviceCount(): Promise<number> {
  const devices = await getRegisteredDevices();
  return devices.filter(d => d.is_active).length;
}

// Get device slots info
export async function getDeviceSlots(): Promise<{ used: number; total: number; remaining: number }> {
  const used = await getActiveDeviceCount();
  return {
    used,
    total: MAX_DEVICES,
    remaining: MAX_DEVICES - used
  };
}

// Helper to save devices
async function saveDevices(devices: Device[]): Promise<void> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: DEVICES_KEY } }).exec();
  const now = new Date().toISOString();
  
  if (record) {
    await record.patch({
      value: JSON.stringify(devices),
      updated_at: now
    });
  } else {
    await db.settings.insert({
      key: DEVICES_KEY,
      value: JSON.stringify(devices),
      updated_at: now
    });
  }
}
