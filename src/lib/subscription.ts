// Subscription & License Management for Offline-First
import { getDatabase } from './offline-db/database';

export type SubscriptionStatus = 'trial' | 'active' | 'expired';
export type PremiumFeature = 
  | 'advanced_reports'
  | 'compliance_pack'
  | 'audit_export'
  | 'multi_user'
  | 'email_notifications';

const PREMIUM_FEATURES: PremiumFeature[] = [
  'advanced_reports',
  'compliance_pack',
  'audit_export',
  'multi_user',
  'email_notifications'
];

// Embedded public key for license validation (RSA public key)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw5VxsYP0rYtJqQz0fLoX
rSyXh3GnYyL8AxFtB7z1nEWwZKQjqN8fLGZeKxTnT7DMJD6RXKu3C5T5a+dJoLqz
hYz1VyJFHuWu5YvJ5X5y0WvK1eXJGz3QpLqZB3xWdRfTdLhT9XKm0xB6mFMqZzVe
3qJKkZLXqVrZKp0q0WdJL8T5B9aTfLkXqUvCxQfZbJ7LqD0ZqQ0xLHQC8VbLCzPu
placeholder_for_demo
-----END PUBLIC KEY-----`;

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan: string;
  trialDaysRemaining: number;
  expiresAt: string | null;
  licenseKey: string | null;
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  const db = await getDatabase();
  const sub = await db.subscription.findOne({ selector: { id: 'main_subscription' } }).exec();
  
  if (!sub) {
    // Create default trial
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    await db.subscription.insert({
      id: 'main_subscription',
      status: 'trial',
      plan: 'business',
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      license_key: null,
      activated_at: null,
      expires_at: null
    });
    return {
      status: 'trial',
      plan: 'business',
      trialDaysRemaining: 14,
      expiresAt: null,
      licenseKey: null
    };
  }

  const data = sub.toJSON();
  const now = new Date();
  
  // Check if trial expired
  if (data.status === 'trial') {
    const trialEnd = new Date(data.trial_end);
    const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysRemaining <= 0) {
      await sub.patch({ status: 'expired' });
      return {
        status: 'expired',
        plan: data.plan,
        trialDaysRemaining: 0,
        expiresAt: null,
        licenseKey: data.license_key
      };
    }
    
    return {
      status: 'trial',
      plan: data.plan,
      trialDaysRemaining: daysRemaining,
      expiresAt: null,
      licenseKey: data.license_key
    };
  }

  // Check if subscription expired
  if (data.status === 'active' && data.expires_at) {
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      await sub.patch({ status: 'expired' });
      return {
        status: 'expired',
        plan: data.plan,
        trialDaysRemaining: 0,
        expiresAt: data.expires_at,
        licenseKey: data.license_key
      };
    }
  }

  return {
    status: data.status,
    plan: data.plan,
    trialDaysRemaining: 0,
    expiresAt: data.expires_at,
    licenseKey: data.license_key
  };
}

export async function canAccessFeature(feature: PremiumFeature): Promise<boolean> {
  const sub = await getSubscriptionInfo();
  
  // Trial and active subscriptions have full access
  if (sub.status === 'trial' || sub.status === 'active') {
    return true;
  }
  
  // Expired subscriptions can't access premium features
  return !PREMIUM_FEATURES.includes(feature);
}

export async function activateLicense(licenseKey: string): Promise<{ success: boolean; message: string }> {
  // Simple license validation
  // In production, this would verify a signed JWT or similar
  
  if (!licenseKey || licenseKey.length < 20) {
    return { success: false, message: 'Invalid license key format' };
  }

  // Check if it's a valid format: BZSUITE-XXXX-XXXX-XXXX-XXXX
  const licensePattern = /^BZSUITE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!licensePattern.test(licenseKey)) {
    return { success: false, message: 'Invalid license key format. Expected: BZSUITE-XXXX-XXXX-XXXX-XXXX' };
  }

  try {
    const db = await getDatabase();
    const sub = await db.subscription.findOne({ selector: { id: 'main_subscription' } }).exec();
    
    if (!sub) {
      return { success: false, message: 'Subscription not found' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await sub.patch({
      status: 'active',
      license_key: licenseKey,
      activated_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    });

    return { success: true, message: 'License activated successfully! Valid for 1 year.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Payment URLs - Only Offline Forever Plan (₹1499 one-time)
export const PAYMENT_CONFIG = {
  offlineDownloadPrice: 1499,
  currency: 'INR',
  upiId: 'pramudittiwari@axl',
  merchantName: 'BizSuite',
  supportEmail: 'parambuilds@proton.me'
};

export function generateUPILink(amount: number, txnNote: string): string {
  const params = new URLSearchParams({
    pa: PAYMENT_CONFIG.upiId,
    pn: PAYMENT_CONFIG.merchantName,
    am: amount.toString(),
    cu: PAYMENT_CONFIG.currency,
    tn: txnNote
  });
  return `upi://pay?${params.toString()}`;
}

export function generateOfflineDownloadPaymentLink(): string {
  return generateUPILink(PAYMENT_CONFIG.offlineDownloadPrice, 'BizSuite Offline Download - Lifetime');
}
