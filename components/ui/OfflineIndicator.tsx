import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

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
    <ThemedView 
      style={[
        {
          padding: 12,
          borderRadius: 8,
          margin: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isOnline ? '#f0f9ff' : '#fef3c7',
          borderWidth: 1,
          borderColor: isOnline ? '#0ea5e9' : '#f59e0b',
        },
        style
      ]}
    >
      <View style={{ flex: 1 }}>
        {!isOnline && (
          <>
            <ThemedText style={{ fontWeight: 'bold', color: '#92400e' }}>
              Offline Mode
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#92400e' }}>
              Changes will sync when online
            </ThemedText>
          </>
        )}
        
        {syncError && (
          <>
            <ThemedText style={{ fontWeight: 'bold', color: '#dc2626' }}>
              Sync Error
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#dc2626' }}>
              {syncError}
            </ThemedText>
          </>
        )}
        
        {isSyncing && (
          <>
            <ThemedText style={{ fontWeight: 'bold', color: '#0ea5e9' }}>
              Syncing...
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: '#0ea5e9' }}>
              Updating data
            </ThemedText>
          </>
        )}
        
        {isOnline && lastSyncTime && !isSyncing && (
          <ThemedText style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Last sync: {formatLastSync(lastSyncTime)}
          </ThemedText>
        )}
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isSyncing && (
          <ActivityIndicator size="small" color="#0ea5e9" style={{ marginRight: 8 }} />
        )}
        
        {syncError && (
          <TouchableOpacity
            onPress={dismissSyncError}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginRight: 8,
            }}
          >
            <ThemedText style={{ color: '#dc2626', fontSize: 12 }}>
              Dismiss
            </ThemedText>
          </TouchableOpacity>
        )}
        
        {isOnline && !isSyncing && (
          <TouchableOpacity
            onPress={performSync}
            style={{
              backgroundColor: '#0ea5e9',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              Sync Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
};
