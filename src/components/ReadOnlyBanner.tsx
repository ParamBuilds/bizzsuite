// Read-Only Mode Banner for Phase 3.2
import { useAppMode } from '@/contexts/AppModeContext';
import { AlertTriangle, Clock, Lock, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ReadOnlyBanner = () => {
  const { mode, reason, graceModeRemaining } = useAppMode();
  const navigate = useNavigate();

  if (mode === 'normal') return null;

  const isGraceMode = mode === 'grace';
  const Icon = isGraceMode ? Clock : Lock;
  const bgColor = isGraceMode ? 'bg-warning/10 border-warning/50' : 'bg-destructive/10 border-destructive/50';
  const textColor = isGraceMode ? 'text-warning' : 'text-destructive';
  const iconColor = isGraceMode ? 'text-warning' : 'text-destructive';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b px-4 py-3`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
            <div>
              <span className={`font-medium ${textColor}`}>
                {isGraceMode ? 'Grace Mode Active' : 'Read-Only Mode Enabled'}
              </span>
              <p className="text-sm text-muted-foreground">
                {reason}
                {isGraceMode && graceModeRemaining && (
                  <span className="ml-2 font-medium">({graceModeRemaining}h remaining)</span>
                )}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant={isGraceMode ? 'outline' : 'default'}
            onClick={() => navigate('/pricing')}
          >
            Activate License
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
