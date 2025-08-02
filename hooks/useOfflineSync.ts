import { useCallback, useEffect, useState } from 'react';
import { NetworkService } from '../services/network/NetworkService';
import { syncService } from '../services/sync/SyncService';
import { useAuthUser } from './useAuth';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(NetworkService.isConnected());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user } = useAuthUser();

  const performSync = useCallback(async () => {
    if (!user || !isOnline || isSyncing) return;
    
    try {
      // The sync status listener will handle setting isSyncing states
      const userKey = (user as any).which_key || (user as any).$id;
      await syncService.syncAll(userKey);
    } catch (error) {
      console.error('Manual sync failed:', error);
      // Don't set sync error here - let the sync status listener handle it
    }
  }, [user, isOnline, isSyncing]);

  useEffect(() => {
    // Listen to network changes
    const unsubscribeNetwork = NetworkService.addListener(setIsOnline);
    
    // Listen to sync status changes
    const unsubscribeSync = syncService.addSyncStatusListener((status) => {
      switch (status) {
        case 'started':
          setIsSyncing(true);
          setSyncError(null);
          break;
        case 'completed':
          setIsSyncing(false);
          setLastSyncTime(new Date());
          setSyncError(null);
          break;
        case 'error':
          setIsSyncing(false);
          setSyncError('Sync failed. Some data may not be up to date.');
          break;
      }
    });

    // Start network monitoring
    NetworkService.startConnectivityMonitoring();

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  // Auto sync when coming back online
  useEffect(() => {
    if (isOnline && user && !isSyncing) {
      performSync();
    }
  }, [isOnline, user, isSyncing, performSync]);

  const dismissSyncError = () => {
    setSyncError(null);
  };

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    performSync,
    dismissSyncError
  };
};
