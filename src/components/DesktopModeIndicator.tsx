import { Badge } from '@/components/ui/badge';
import { Monitor, WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { isDesktopMode } from '@/lib/desktop-mode';

export function DesktopModeIndicator() {
  const isOnline = useOnlineStatus();
  const isDesktop = isDesktopMode();

  // Show indicator in desktop mode OR when offline
  if (!isDesktop && isOnline) return null;

  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
      {isDesktop && (
        <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1">
          <Monitor className="h-3 w-3" />
          <span className="text-xs">Desktop Mode</span>
        </Badge>
      )}
      <Badge 
        variant={isOnline ? 'default' : 'outline'} 
        className="flex items-center gap-1.5 px-2 py-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span className="text-xs">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Offline</span>
          </>
        )}
      </Badge>
    </div>
  );
}
