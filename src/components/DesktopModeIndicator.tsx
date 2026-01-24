import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Badge } from '@/components/ui/badge';
import { Monitor, WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DesktopModeIndicator() {
  const { isStandalone } = usePWAInstall();
  const isOnline = useOnlineStatus();

  if (!isStandalone) return null;

  return (
    <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-1">
        <Monitor className="h-3 w-3" />
        <span className="text-xs">Desktop Mode</span>
      </Badge>
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
