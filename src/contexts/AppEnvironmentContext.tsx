/**
 * App Environment Context
 * 
 * Manages the user's chosen mode (Desktop vs Online) and persists preference.
 * Desktop mode uses local IndexedDB only, Online mode uses Supabase.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isDesktopMode as detectDesktopMode, isElectron } from '@/lib/desktop-mode';
import { dataProvider } from '@/lib/offline-db/data-provider';

export type EnvironmentMode = 'desktop' | 'online';

interface AppEnvironmentContextType {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  isOnline: boolean;
  isDesktopApp: boolean;
  canSwitchMode: boolean;
}

const AppEnvironmentContext = createContext<AppEnvironmentContextType | undefined>(undefined);

const STORAGE_KEY = 'bizsuite_environment_mode';

export function useAppEnvironment() {
  const context = useContext(AppEnvironmentContext);
  if (!context) {
    throw new Error('useAppEnvironment must be used within AppEnvironmentProvider');
  }
  return context;
}

export const AppEnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDesktopApp = detectDesktopMode();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Initialize mode based on detection or stored preference
  const getInitialMode = (): EnvironmentMode => {
    // If running in Electron, default to desktop
    if (isElectron()) {
      return 'desktop';
    }
    
    // Check stored preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'desktop' || stored === 'online') {
      return stored;
    }
    
    // Default based on environment
    return isDesktopApp ? 'desktop' : 'online';
  };
  
  const [mode, setModeState] = useState<EnvironmentMode>(getInitialMode);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const setMode = useCallback((newMode: EnvironmentMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    
    // Update the data provider mode accordingly
    if (newMode === 'desktop') {
      dataProvider.setMode('offline');
    } else {
      dataProvider.setMode('hybrid');
    }
  }, []);
  
  // Sync data provider mode on initial load
  useEffect(() => {
    if (mode === 'desktop') {
      dataProvider.setMode('offline');
    } else {
      dataProvider.setMode('hybrid');
    }
  }, [mode]);
  
  // Can switch mode unless running in pure Electron
  const canSwitchMode = !isElectron();
  
  return (
    <AppEnvironmentContext.Provider value={{
      mode,
      setMode,
      isOnline,
      isDesktopApp,
      canSwitchMode
    }}>
      {children}
    </AppEnvironmentContext.Provider>
  );
};
