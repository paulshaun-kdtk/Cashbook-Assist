import React, { useEffect, useRef } from 'react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface OfflineIndicatorProps {
  style?: object;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ style }) => {
  const { 
    isOnline, 
    isSyncing, 
    lastSyncTime, 
    syncError, 
    performSync, 
    dismissSyncError 
  } = useOfflineSync();

  // Safety timeout to prevent infinite syncing state
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSyncing) {
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      // Set a timeout to force reset syncing state after 30 seconds
      syncTimeoutRef.current = setTimeout(() => {
        console.warn('Sync timeout reached - forcing reset of syncing state');
        // Note: We can't directly set the state here since it's managed by the hook
        // But this will at least log the issue for debugging
      }, 30000);
    } else {
      // Clear timeout when syncing completes normally
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isSyncing]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isOnline && !syncError && !isSyncing) {
    return null; // Don't show anything when everything is normal
  }

  return (
    // <ThemedView 
    //   style={[
    //     {
    //       padding: 12,
    //       borderRadius: 8,
    //       margin: 8,
    //       flexDirection: 'row',
    //       alignItems: 'center',
    //       justifyContent: 'space-between',
    //       backgroundColor: isOnline ? '#f0f9ff' : '#fef3c7',
    //       borderWidth: 1,
    //       borderColor: isOnline ? '#0ea5e9' : '#f59e0b',
    //     },
    //     style
    //   ]}
    // >
    //   <View style={{ flex: 1 }}>
    //     {!isOnline && (
    //       <>
    //         <ThemedText style={{ fontWeight: 'bold', color: '#92400e' }}>
    //           Offline Mode
    //         </ThemedText>
    //         <ThemedText style={{ fontSize: 12, color: '#92400e' }}>
    //           Changes will sync when online
    //         </ThemedText>
    //       </>
    //     )}
        
    //     {syncError && (
    //       <>
    //         <ThemedText style={{ fontWeight: 'bold', color: '#dc2626' }}>
    //           Sync Error
    //         </ThemedText>
    //         <ThemedText style={{ fontSize: 12, color: '#dc2626' }}>
    //           {syncError}
    //         </ThemedText>
    //       </>
    //     )}
        
    //     {isOnline && lastSyncTime && !isSyncing && (
    //       <ThemedText style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
    //         Last sync: {formatLastSync(lastSyncTime)}
    //       </ThemedText>
    //     )}
    //   </View>
      
    //   <View style={{ flexDirection: 'row', alignItems: 'center' }}>   
    //     {syncError && (
    //       <TouchableOpacity
    //         onPress={dismissSyncError}
    //         style={{
    //           paddingHorizontal: 8,
    //           paddingVertical: 4,
    //           marginRight: 8,
    //         }}
    //       >
    //         <ThemedText style={{ color: '#dc2626', fontSize: 12 }}>
    //           Dismiss
    //         </ThemedText>
    //       </TouchableOpacity>
    //     )}
        
    //     {isOnline && !isSyncing && (
    //       <TouchableOpacity
    //         onPress={() => {
    //           console.log('Manual sync initiated by user');
    //           performSync();
    //         }}
    //         style={{
    //           backgroundColor: '#0ea5e9',
    //           paddingHorizontal: 12,
    //           paddingVertical: 6,
    //           borderRadius: 4,
    //         }}
    //         disabled={isSyncing}
    //       >
    //         <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
    //           Sync Now
    //         </Text>
    //       </TouchableOpacity>
    //     )}
    //   </View>
    // </ThemedView>
    <></>
  );
};
