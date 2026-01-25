import { useState, useEffect, useCallback } from 'react';

/**
 * Enhanced online status hook that performs actual network connectivity checks
 * instead of just relying on navigator.onLine (which only checks adapter status)
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Perform actual connectivity check by fetching a small resource
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a small, cache-busted resource
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/favicon.ico?_=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // If local fetch fails, try an external ping (if not in desktop mode)
      if (window.location.protocol !== 'file:') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          // Try to reach a reliable external endpoint
          await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  // Update online status with actual connectivity check
  const updateOnlineStatus = useCallback(async () => {
    const actuallyOnline = navigator.onLine && await checkConnectivity();
    setIsOnline(actuallyOnline);
    setLastChecked(new Date());
  }, [checkConnectivity]);

  useEffect(() => {
    // Initial check
    updateOnlineStatus();

    const handleOnline = () => {
      // When browser reports online, verify with actual check
      updateOnlineStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChecked(new Date());
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check every 30 seconds
    const intervalId = setInterval(updateOnlineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [updateOnlineStatus]);

  return isOnline;
}

/**
 * Hook that provides both status and manual refresh capability
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/favicon.ico?_=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const online = response.ok;
      setIsOnline(online);
      setLastChecked(new Date());
      setIsChecking(false);
      return online;
    } catch {
      // Try external check
      if (window.location.protocol !== 'file:') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          setIsOnline(true);
          setLastChecked(new Date());
          setIsChecking(false);
          return true;
        } catch {
          setIsOnline(false);
          setLastChecked(new Date());
          setIsChecking(false);
          return false;
        }
      }
      setIsOnline(false);
      setLastChecked(new Date());
      setIsChecking(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkConnectivity();

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => {
      setIsOnline(false);
      setLastChecked(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const intervalId = setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnectivity]);

  return { isOnline, isChecking, lastChecked, refresh: checkConnectivity };
}
