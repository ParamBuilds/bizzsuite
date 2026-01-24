// Clock & Tamper Resilience for Phase 3.2
import { getDatabase } from './offline-db/database';

export interface ClockVerification {
  lastVerifiedAt: string;
  monotonicCounter: number;
  usageCounter: number;
  lastKnownTime: string;
  warningShown: boolean;
  graceModeUntil: string | null;
}

const CLOCK_KEY = 'clock_verification_main';
const GRACE_PERIOD_HOURS = 24;

// Initialize or get clock verification record
export async function getClockVerification(): Promise<ClockVerification> {
  const db = await getDatabase();
  
  // Check if app_state collection exists, use settings as fallback
  let record = await db.settings.findOne({ selector: { key: CLOCK_KEY } }).exec();
  
  if (!record) {
    const now = new Date().toISOString();
    const initial: ClockVerification = {
      lastVerifiedAt: now,
      monotonicCounter: 0,
      usageCounter: 0,
      lastKnownTime: now,
      warningShown: false,
      graceModeUntil: null
    };
    
    await db.settings.insert({
      key: CLOCK_KEY,
      value: JSON.stringify(initial),
      updated_at: now
    });
    
    return initial;
  }
  
  return JSON.parse(record.value);
}

// Increment usage counter on each app action
export async function incrementUsageCounter(): Promise<void> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: CLOCK_KEY } }).exec();
  
  if (record) {
    const data: ClockVerification = JSON.parse(record.value);
    data.usageCounter += 1;
    data.monotonicCounter += 1;
    data.lastKnownTime = new Date().toISOString();
    
    await record.patch({
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    });
  }
}

// Check for clock tampering
export async function checkClockTampering(): Promise<{
  isSuspicious: boolean;
  reason?: string;
  inGraceMode: boolean;
  graceModeRemaining?: number; // hours
}> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: CLOCK_KEY } }).exec();
  
  if (!record) {
    return { isSuspicious: false, inGraceMode: false };
  }
  
  const data: ClockVerification = JSON.parse(record.value);
  const now = new Date();
  const lastKnown = new Date(data.lastKnownTime);
  
  // Check if system time went backwards significantly (more than 1 hour)
  const timeDiff = now.getTime() - lastKnown.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Suspicious if time went backwards by more than 1 hour
  if (hoursDiff < -1) {
    // Check if already in grace mode
    if (data.graceModeUntil) {
      const graceEnd = new Date(data.graceModeUntil);
      if (now < graceEnd) {
        const remaining = (graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
        return {
          isSuspicious: true,
          reason: 'System clock appears to have been rolled back',
          inGraceMode: true,
          graceModeRemaining: Math.ceil(remaining)
        };
      }
    }
    
    // Enter grace mode
    const graceModeUntil = new Date(now.getTime() + GRACE_PERIOD_HOURS * 60 * 60 * 1000);
    data.graceModeUntil = graceModeUntil.toISOString();
    data.warningShown = true;
    
    await record.patch({
      value: JSON.stringify(data),
      updated_at: now.toISOString()
    });
    
    return {
      isSuspicious: true,
      reason: 'System clock appears to have been rolled back',
      inGraceMode: true,
      graceModeRemaining: GRACE_PERIOD_HOURS
    };
  }
  
  // Update last known time
  data.lastKnownTime = now.toISOString();
  await record.patch({
    value: JSON.stringify(data),
    updated_at: now.toISOString()
  });
  
  return { isSuspicious: false, inGraceMode: false };
}

// Verify and update clock state on app start
export async function verifyClockOnStart(): Promise<void> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: CLOCK_KEY } }).exec();
  
  const now = new Date().toISOString();
  
  if (!record) {
    await db.settings.insert({
      key: CLOCK_KEY,
      value: JSON.stringify({
        lastVerifiedAt: now,
        monotonicCounter: 1,
        usageCounter: 0,
        lastKnownTime: now,
        warningShown: false,
        graceModeUntil: null
      }),
      updated_at: now
    });
  } else {
    const data: ClockVerification = JSON.parse(record.value);
    data.lastVerifiedAt = now;
    data.monotonicCounter += 1;
    
    await record.patch({
      value: JSON.stringify(data),
      updated_at: now
    });
  }
}

// Reset clock warnings (called after successful license revalidation)
export async function resetClockWarnings(): Promise<void> {
  const db = await getDatabase();
  const record = await db.settings.findOne({ selector: { key: CLOCK_KEY } }).exec();
  
  if (record) {
    const data: ClockVerification = JSON.parse(record.value);
    data.warningShown = false;
    data.graceModeUntil = null;
    
    await record.patch({
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    });
  }
}
