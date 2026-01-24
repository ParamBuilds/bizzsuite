import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-warning/90 px-4 py-2 text-sm font-medium text-warning-foreground backdrop-blur-sm"
        >
          <WifiOff className="h-4 w-4" />
          <span>Offline — changes saved locally</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SyncStatusIndicator({ 
  pendingChanges = 0,
  onSync 
}: { 
  pendingChanges?: number;
  onSync?: () => void;
}) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
      </div>
    );
  }

  if (pendingChanges > 0) {
    return (
      <button
        onClick={onSync}
        className="flex items-center gap-2 text-sm text-warning hover:text-warning/80 transition-colors"
      >
        <Cloud className="h-4 w-4" />
        <span>{pendingChanges} pending</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-success">
      <Cloud className="h-4 w-4" />
      <span>Synced</span>
    </div>
  );
}
