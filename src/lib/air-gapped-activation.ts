// Air-Gapped Activation for Zero-Internet Environments
import { getDatabase } from './offline-db/database';

export interface LicenseFile {
  version: string;
  licenseKey: string;
  issuedAt: string;
  expiresAt: string;
  deviceLimit: number;
  signature: string;
  metadata: {
    plan: string;
    email?: string;
    organization?: string;
  };
}

// Validate license file structure
export function validateLicenseFileStructure(data: any): data is LicenseFile {
  return (
    typeof data === 'object' &&
    typeof data.version === 'string' &&
    typeof data.licenseKey === 'string' &&
    typeof data.issuedAt === 'string' &&
    typeof data.expiresAt === 'string' &&
    typeof data.deviceLimit === 'number' &&
    typeof data.signature === 'string' &&
    typeof data.metadata === 'object'
  );
}

// Simple signature verification (for demo - use proper crypto in production)
export function verifyLicenseSignature(license: LicenseFile): boolean {
  // In production, this would use RSA/ECDSA verification
  // For now, verify the signature format and basic integrity
  const expectedPrefix = 'SIG-BZSUITE-';
  if (!license.signature.startsWith(expectedPrefix)) {
    return false;
  }

  // Verify license key format
  const keyPattern = /^BZSUITE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(license.licenseKey)) {
    return false;
  }

  // Check expiry
  const expiresAt = new Date(license.expiresAt);
  if (isNaN(expiresAt.getTime())) {
    return false;
  }

  return true;
}

// Import license from JSON file
export async function importLicenseFile(file: File): Promise<{ success: boolean; message: string; license?: LicenseFile }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!validateLicenseFileStructure(data)) {
      return { success: false, message: 'Invalid license file format' };
    }

    if (!verifyLicenseSignature(data)) {
      return { success: false, message: 'License signature verification failed' };
    }

    // Check if license is expired
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);
    if (now > expiresAt) {
      return { success: false, message: 'This license has expired' };
    }

    // Activate the license
    const db = await getDatabase();
    const sub = await db.subscription.findOne({ selector: { id: 'main_subscription' } }).exec();

    if (sub) {
      await sub.patch({
        status: 'active',
        license_key: data.licenseKey,
        activated_at: new Date().toISOString(),
        expires_at: data.expiresAt,
        plan: data.metadata.plan || 'business'
      });
    } else {
      await db.subscription.insert({
        id: 'main_subscription',
        status: 'active',
        plan: data.metadata.plan || 'business',
        trial_start: new Date().toISOString(),
        trial_end: new Date().toISOString(),
        license_key: data.licenseKey,
        activated_at: new Date().toISOString(),
        expires_at: data.expiresAt
      });
    }

    // Store air-gapped mode flag
    localStorage.setItem('air-gapped-mode', 'true');
    localStorage.setItem('license-file-import', JSON.stringify({
      importedAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
      deviceLimit: data.deviceLimit
    }));

    return { 
      success: true, 
      message: 'License activated successfully in air-gapped mode',
      license: data
    };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return { success: false, message: 'Invalid JSON file' };
    }
    return { success: false, message: error.message || 'Failed to import license' };
  }
}

// Check if running in air-gapped mode
export function isAirGappedMode(): boolean {
  return localStorage.getItem('air-gapped-mode') === 'true';
}

// Generate a sample license file for testing
export function generateSampleLicenseFile(): LicenseFile {
  const now = new Date();
  // Lifetime license - 99 years (effectively forever)
  const expiresAt = new Date(now.getTime() + 99 * 365 * 24 * 60 * 60 * 1000);
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  const licenseKey = `BZSUITE-${segments.join('-')}`;

  return {
    version: '1.0',
    licenseKey,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    deviceLimit: 3,
    signature: `SIG-BZSUITE-${Date.now().toString(36).toUpperCase()}`,
    metadata: {
      plan: 'business',
      organization: 'Sample Organization'
    }
  };
}

// Export license file for download
export function downloadSampleLicense(): void {
  const license = generateSampleLicenseFile();
  const blob = new Blob([JSON.stringify(license, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bizsuite-license.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
