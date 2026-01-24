// Emergency Read-Only Mode Context for Phase 3.2
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSubscriptionInfo, SubscriptionInfo } from '@/lib/subscription';
import { verifyAuditChain } from '@/lib/offline-db/audit-logger';
import { checkClockTampering, verifyClockOnStart } from '@/lib/clock-tamper';
import { getDatabase } from '@/lib/offline-db/database';

export type AppMode = 'normal' | 'read_only' | 'grace';

export interface AppModeState {
  mode: AppMode;
  reason?: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean; // Basic CSV export always allowed in read-only
  graceModeRemaining?: number; // hours
  subscription: SubscriptionInfo | null;
  auditChainValid: boolean;
  clockTamperDetected: boolean;
}

interface AppModeContextType extends AppModeState {
  refresh: () => Promise<void>;
  checkPermission: (action: 'create' | 'edit' | 'delete' | 'export') => boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppModeState>({
    mode: 'normal',
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    subscription: null,
    auditChainValid: true,
    clockTamperDetected: false
  });

  const evaluateMode = useCallback(async () => {
    try {
      // Initialize clock tracking
      await verifyClockOnStart();
      
      // Get subscription status
      const subInfo = await getSubscriptionInfo();
      
      // Check audit chain integrity
      const auditResult = await verifyAuditChain();
      
      // Check for clock tampering
      const clockResult = await checkClockTampering();
      
      let newMode: AppMode = 'normal';
      let reason: string | undefined;
      let graceModeRemaining: number | undefined;
      
      // Priority 1: Expired subscription
      if (subInfo.status === 'expired') {
        newMode = 'read_only';
        reason = 'Subscription expired. Activate a license to resume operations.';
      }
      
      // Priority 2: Audit chain broken
      if (!auditResult.valid) {
        newMode = 'read_only';
        reason = 'Audit chain integrity check failed. Data may have been tampered with.';
      }
      
      // Priority 3: Clock tampering detected (grace mode, not hard lock)
      if (clockResult.isSuspicious) {
        if (clockResult.inGraceMode) {
          newMode = 'grace';
          reason = clockResult.reason;
          graceModeRemaining = clockResult.graceModeRemaining;
        }
      }
      
      // Determine permissions based on mode
      const canModify = newMode === 'normal' || newMode === 'grace';
      
      setState({
        mode: newMode,
        reason,
        canCreate: canModify,
        canEdit: canModify,
        canDelete: canModify,
        canExport: true, // Always allow basic export
        graceModeRemaining,
        subscription: subInfo,
        auditChainValid: auditResult.valid,
        clockTamperDetected: clockResult.isSuspicious
      });
    } catch (error) {
      console.error('Failed to evaluate app mode:', error);
      // Default to allowing operations if evaluation fails
      setState(prev => ({
        ...prev,
        mode: 'normal',
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true
      }));
    }
  }, []);

  useEffect(() => {
    evaluateMode();
    
    // Re-evaluate periodically (every 5 minutes)
    const interval = setInterval(evaluateMode, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [evaluateMode]);

  const checkPermission = useCallback((action: 'create' | 'edit' | 'delete' | 'export'): boolean => {
    switch (action) {
      case 'create': return state.canCreate;
      case 'edit': return state.canEdit;
      case 'delete': return state.canDelete;
      case 'export': return state.canExport;
      default: return false;
    }
  }, [state]);

  return (
    <AppModeContext.Provider value={{
      ...state,
      refresh: evaluateMode,
      checkPermission
    }}>
      {children}
    </AppModeContext.Provider>
  );
};
