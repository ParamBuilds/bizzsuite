// Installer Download Utilities
// Handles the download of the full program installer

import { FINAL_PRODUCT_MODE } from './final-product-mode';

export interface InstallerInfo {
  version: string;
  fileName: string;
  platform: 'windows' | 'mac' | 'linux' | 'pwa';
  size: string;
  downloadUrl: string;
}

// Detect current platform
export function detectPlatform(): 'windows' | 'mac' | 'linux' | 'pwa' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'pwa';
}

// Get installer info for each platform
export function getInstallerInfo(platform?: 'windows' | 'mac' | 'linux' | 'pwa'): InstallerInfo {
  const currentPlatform = platform || detectPlatform();
  const version = FINAL_PRODUCT_MODE.version;
  
  const installers: Record<string, InstallerInfo> = {
    windows: {
      version,
      fileName: `BizSuite-Setup-v${version}.exe`,
      platform: 'windows',
      size: '85 MB',
      downloadUrl: '#' // In production, this would be the actual download URL
    },
    mac: {
      version,
      fileName: `BizSuite-v${version}.dmg`,
      platform: 'mac',
      size: '92 MB',
      downloadUrl: '#'
    },
    linux: {
      version,
      fileName: `BizSuite-v${version}.AppImage`,
      platform: 'linux',
      size: '88 MB',
      downloadUrl: '#'
    },
    pwa: {
      version,
      fileName: 'Progressive Web App',
      platform: 'pwa',
      size: 'Install from browser',
      downloadUrl: '#'
    }
  };
  
  return installers[currentPlatform];
}

// Get all available installers
export function getAllInstallers(): InstallerInfo[] {
  return [
    getInstallerInfo('windows'),
    getInstallerInfo('mac'),
    getInstallerInfo('linux'),
  ];
}

// Simulate installer download (in production, this would trigger actual download)
export function downloadInstaller(platform?: 'windows' | 'mac' | 'linux' | 'pwa'): void {
  // Convert pwa to windows as default
  const targetPlatform = platform === 'pwa' ? 'windows' : (platform || 'windows');
  const installer = getInstallerInfo(targetPlatform);
  
  // In production, this would redirect to actual download URL
  // For now, we create a placeholder file to demonstrate the flow
  const placeholderContent = `
BizSuite Offline Installer
===========================
Version: ${installer.version}
Platform: ${installer.platform}
File: ${installer.fileName}

This is a placeholder for the actual installer.

In production, this download would provide:
- Full offline application
- Native installer for your operating system
- No internet required after installation

Installation Steps:
1. Run the downloaded installer
2. Follow the installation wizard
3. Open BizSuite from your applications
4. Enter your activation key when prompted

Your app will work 100% offline after activation.

For support: parambuilds@proton.me
`;

  const blob = new Blob([placeholderContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BizSuite-Installer-Info-v${installer.version}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Check if PWA can be installed
export function canInstallPWA(): boolean {
  return 'serviceWorker' in navigator && 
         window.matchMedia('(display-mode: browser)').matches;
}

// Installation steps content
export const INSTALLATION_STEPS = [
  {
    step: 1,
    title: 'Download the Installer',
    description: 'Download the installer for your operating system (Windows, Mac, or Linux).',
    icon: 'download'
  },
  {
    step: 2,
    title: 'Install the Software',
    description: 'Run the installer and follow the setup wizard. No internet required during installation.',
    icon: 'package'
  },
  {
    step: 3,
    title: 'Open BizSuite',
    description: 'Launch BizSuite from your applications folder or desktop shortcut.',
    icon: 'play'
  },
  {
    step: 4,
    title: 'Activate Your License',
    description: 'Enter your activation key or import your license file. The app will work offline forever.',
    icon: 'key'
  }
] as const;
