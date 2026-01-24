/**
 * Desktop Mode Detection & Utilities
 * 
 * Detects whether the app is running in Electron/file:// mode
 * and provides utilities for desktop-specific behavior.
 */

/**
 * Returns true if running via file:// protocol (Electron/desktop)
 */
export function isFileProtocol(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'file:';
}

/**
 * Returns true if running inside Electron
 */
export function isElectron(): boolean {
  // Check for Electron-specific globals
  if (typeof window === 'undefined') return false;
  
  // Check userAgent for Electron
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('electron')) return true;
  
  // Check for file protocol as fallback
  return isFileProtocol();
}

/**
 * Returns true if running in desktop mode (Electron or file://)
 */
export function isDesktopMode(): boolean {
  return isFileProtocol() || isElectron();
}

/**
 * Returns true if PWA features should be enabled
 * PWA is disabled in desktop/Electron mode
 */
export function shouldEnablePWA(): boolean {
  return !isDesktopMode();
}

/**
 * Returns true if service worker should be registered
 * SW is disabled in desktop/Electron mode
 */
export function shouldRegisterServiceWorker(): boolean {
  return !isDesktopMode() && 'serviceWorker' in navigator;
}

/**
 * Log desktop mode status for debugging
 */
export function logDesktopStatus(): void {
  console.log('[Desktop Mode]', {
    protocol: window.location.protocol,
    isFileProtocol: isFileProtocol(),
    isElectron: isElectron(),
    isDesktopMode: isDesktopMode(),
    shouldEnablePWA: shouldEnablePWA(),
    shouldRegisterServiceWorker: shouldRegisterServiceWorker()
  });
}
