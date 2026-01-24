// Installer Download Utilities
// Handles the download of the full program installer

import { FINAL_PRODUCT_MODE } from './final-product-mode';

// Installer URLs hosted on GitHub Releases
export const INSTALLER_CONFIG = {
  windows: {
    url: 'https://github.com/ParamBuilds/bizzsuite/releases/download/BizSuite/BizSuite-Setup.exe',
    fileName: 'BizSuite-Setup.exe',
    size: '~100 MB',
  },
  mac: {
    url: '', // Coming soon - Mac installer
    fileName: 'BizSuite.dmg',
    size: '~100 MB',
  },
  linux: {
    url: '', // Coming soon - Linux installer
    fileName: 'BizSuite.AppImage',
    size: '~100 MB',
  },
  // Support email for when installers are unavailable
  supportEmail: 'parambuilds@proton.me',
};

export interface InstallerInfo {
  version: string;
  fileName: string;
  platform: 'windows' | 'mac' | 'linux' | 'pwa';
  size: string;
  downloadUrl: string;
  isAvailable: boolean;
}

// Detect current platform
export function detectPlatform(): 'windows' | 'mac' | 'linux' | 'pwa' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'pwa';
}

// Check if an installer is available for a platform
export function isInstallerAvailable(platform: 'windows' | 'mac' | 'linux'): boolean {
  const config = INSTALLER_CONFIG[platform];
  return Boolean(config?.url && config.url.trim() !== '' && config.url !== '#');
}

// Get installer info for each platform
export function getInstallerInfo(platform?: 'windows' | 'mac' | 'linux' | 'pwa'): InstallerInfo {
  const currentPlatform = platform || detectPlatform();
  const version = FINAL_PRODUCT_MODE.version;
  
  // For PWA, default to windows installer info
  const targetPlatform = currentPlatform === 'pwa' ? 'windows' : currentPlatform;
  const config = INSTALLER_CONFIG[targetPlatform];
  
  return {
    version,
    fileName: config.fileName.replace('.', `-v${version}.`),
    platform: currentPlatform,
    size: config.size,
    downloadUrl: config.url,
    isAvailable: isInstallerAvailable(targetPlatform),
  };
}

// Get all available installers
export function getAllInstallers(): InstallerInfo[] {
  return [
    getInstallerInfo('windows'),
    getInstallerInfo('mac'),
    getInstallerInfo('linux'),
  ];
}

// Download the actual installer file
export function downloadInstaller(platform?: 'windows' | 'mac' | 'linux' | 'pwa'): boolean {
  const targetPlatform = platform === 'pwa' ? 'windows' : (platform || 'windows');
  const installer = getInstallerInfo(targetPlatform);
  
  // If real installer URL is available, redirect to it
  if (installer.isAvailable && installer.downloadUrl) {
    window.open(installer.downloadUrl, '_blank');
    return true;
  }
  
  // Installer not available - return false to trigger fallback UI
  return false;
}

// Download the installation guide as a text file (secondary action)
export function downloadInstallGuide(): void {
  const version = FINAL_PRODUCT_MODE.version;
  
  const guideContent = `
BizSuite Installation Guide
============================
Version: ${version}

INSTALLATION STEPS
------------------

Step 1: Download the Installer
   - Download the installer for your operating system
   - Windows: BizSuite-Setup-v${version}.exe
   - Mac: BizSuite-v${version}.dmg
   - Linux: BizSuite-v${version}.AppImage

Step 2: Install the Software
   - Windows: Double-click the .exe file and follow the wizard
   - Mac: Open the .dmg file and drag BizSuite to Applications
   - Linux: Make the AppImage executable and run it

Step 3: Open BizSuite
   - Launch BizSuite from your applications
   - The app will prompt for activation on first run

Step 4: Activate Your License
   - Enter your activation key when prompted
   - OR import your license.json file
   - The app will work 100% offline after activation

OFFLINE OWNERSHIP
-----------------
After activation, BizSuite works completely offline:
- No internet connection required
- No background server checks
- Your data stays on your device
- License never expires

SUPPORT
-------
Email: ${INSTALLER_CONFIG.supportEmail}

This is a one-time purchase. You own this software forever.
`;

  const blob = new Blob([guideContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BizSuite-Install-Guide-v${version}.txt`;
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
