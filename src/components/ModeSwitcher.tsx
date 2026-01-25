/**
 * Mode Switcher Component
 * 
 * Allows users to switch between Desktop Mode (offline-first) and Online Mode.
 * Shows current mode and network status.
 */
import { Monitor, Wifi, WifiOff } from 'lucide-react';
import { useAppEnvironment } from '@/contexts/AppEnvironmentContext';
import { cn } from '@/lib/utils';

export function ModeSwitcher() {
  const { mode, setMode, isOnline, canSwitchMode } = useAppEnvironment();
  
  // Don't render the switcher in Electron - it's locked to desktop mode
  if (!canSwitchMode) return null;
  
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
      {/* Desktop Mode Button */}
      <button
        onClick={() => canSwitchMode && setMode('desktop')}
        disabled={!canSwitchMode}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
          mode === 'desktop'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          !canSwitchMode && "cursor-not-allowed opacity-60"
        )}
      >
        <Monitor className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Desktop Mode</span>
      </button>
      
      {/* Online Mode Button */}
      <button
        onClick={() => canSwitchMode && setMode('online')}
        disabled={!canSwitchMode}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
          mode === 'online'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          !canSwitchMode && "cursor-not-allowed opacity-60"
        )}
      >
        {isOnline ? (
          <Wifi className="h-3.5 w-3.5" />
        ) : (
          <WifiOff className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
      </button>
    </div>
  );
}

/**
 * Compact Mode Indicator for AppLayout sidebar/header
 */
export function CompactModeIndicator() {
  const { mode, isOnline } = useAppEnvironment();
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {mode === 'desktop' ? (
        <>
          <Monitor className="h-3 w-3" />
          <span>Desktop</span>
        </>
      ) : (
        <>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </>
      )}
    </div>
  );
}
