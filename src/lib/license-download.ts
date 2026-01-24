// License Download Utilities
import { generateSampleLicenseFile, type LicenseFile } from './air-gapped-activation';

// Create a license file from an activation key
export function createLicenseFile(licenseKey: string): LicenseFile {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  return {
    version: '1.0',
    licenseKey,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    deviceLimit: 3,
    signature: `SIG-BZSUITE-${Date.now().toString(36).toUpperCase()}`,
    metadata: {
      plan: 'business',
      organization: 'Licensed User'
    }
  };
}

// Download license as JSON file
export function downloadLicenseFile(licenseKey: string): void {
  const license = createLicenseFile(licenseKey);
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

// Download license as ZIP with instructions
export async function downloadLicenseZip(licenseKey: string): Promise<void> {
  // For now, just download the JSON file
  // In a full implementation, this would create a ZIP with:
  // - license.json
  // - README.txt with activation instructions
  // - The offline installer
  downloadLicenseFile(licenseKey);
}

// Generate and store activation key
export function generateActivationKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return `BZSUITE-${segments.join('-')}`;
}
