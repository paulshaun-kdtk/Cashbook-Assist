# Offline Support for Cashbook Assist

This document explains the offline functionality that has been added to the Cashbook Assist React Native application.

## Overview

The offline support allows users to continue using the app even when there's no internet connection. All data operations (create, read, update, delete) work offline and automatically sync when the connection is restored.

## Features

### 1. Local SQLite Database
- All data is stored locally using SQLite
- Supports Companies, Cashbooks, Categories, and Transactions
- Maintains data integrity with foreign key relationships
- Tracks sync status for each record

### 2. Automatic Sync
- Syncs data when app comes online
- Queues offline operations for later synchronization
- Handles sync conflicts gracefully
- Shows sync status in the UI

### 3. Offline-First Architecture
- All operations work offline first
- Network operations are secondary
- Fallback to local data when remote fails
- Optimistic updates for better UX

## Implementation Details

### Services

#### SQLiteService (`services/database/sqlite.ts`)
- Manages local SQLite database
- Provides CRUD operations for all entities
- Handles offline operation queuing
- Tracks sync metadata

#### NetworkService (`services/network/NetworkService.ts`)
- Monitors network connectivity
- Provides connectivity status to other services
- Triggers sync when connection is restored

#### SyncService (`services/sync/SyncService.ts`)
- Handles bidirectional sync between local and remote
- Manages conflict resolution
- Provides sync status callbacks
- Supports manual sync triggers

### Redux Integration

#### Offline Middleware (`redux/middleware/offlineMiddleware.ts`)
- Intercepts Redux actions
- Routes to local storage when offline
- Queues operations for later sync
- Provides offline-aware action handling

#### Updated Thunks
- Modified to work offline-first
- Fall back to local data when remote fails
- Store remote data locally for offline access

### UI Components

#### OfflineIndicator (`components/ui/OfflineIndicator.tsx`)
- Shows current connectivity status
- Displays sync progress
- Provides manual sync button
- Shows sync errors and notifications

## Usage

### For Users

1. **Normal Operation**: The app works normally when online, with data automatically syncing.

2. **Offline Mode**: When offline, the app:
   - Shows an "Offline Mode" indicator
   - Continues to work normally
   - Queues changes for later sync
   - Uses locally cached data

3. **Sync Process**: When connection is restored:
   - App automatically syncs queued changes
   - Shows sync progress in the indicator
   - Updates local data with remote changes

### For Developers

#### Initialization
The offline system is automatically initialized in `app/_layout.tsx`:

```typescript
await OfflineInitializer.initialize();
```

#### Using the Offline Hook
Components can use the `useOfflineSync` hook to monitor offline status:

```typescript
import { useOfflineSync } from '../hooks/useOfflineSync';

const MyComponent = () => {
  const { isOnline, isSyncing, performSync } = useOfflineSync();
  
  return (
    // Your component JSX
  );
};
```

#### Adding Offline Support to New Features

1. **Add to SQLite Schema**: Update `sqlite.ts` with new tables
2. **Create Sync Logic**: Add sync methods in `SyncService.ts`
3. **Update Middleware**: Add action types to `offlineMiddleware.ts`
4. **Modify Thunks**: Make thunks offline-aware

## Database Schema

### Tables Created

1. **companies** - Company information
2. **cashbooks** - Cashbook records
3. **categories** - Transaction categories
4. **transactions** - Income and expense transactions
5. **offline_operations** - Queue of pending sync operations
6. **sync_metadata** - Last sync timestamps per table

### Key Fields

All tables include:
- `is_synced`: Boolean indicating if record is synced with remote
- `is_deleted`: Boolean for soft deletes
- Standard Appwrite fields (`$id`, `$createdAt`, etc.)

## Error Handling

### Sync Errors
- Network failures during sync are handled gracefully
- Operations are retried on next sync attempt
- User is notified of sync failures via the indicator

### Database Errors
- SQLite errors are logged and fallback to remote data
- Database corruption is handled with re-initialization
- Data integrity is maintained through transactions

## Performance Considerations

### Sync Strategy
- Incremental sync based on last sync timestamp
- Pagination for large datasets
- Background sync to avoid blocking UI

### Storage Management
- Local data is automatically cleaned up
- Synced operations are removed from queue
- Database size is monitored and managed

## Troubleshooting

### Common Issues

1. **Sync Stuck**: Use manual sync button in the offline indicator
2. **Database Corruption**: App will reinitialize database automatically
3. **Network Detection**: Restart app if network status is incorrect

### Debug Information

Check console logs for:
- `SQLite database initialized`
- `Network service initialized`
- `Sync started/completed/failed`

## Future Enhancements

### Potential Improvements

1. **Conflict Resolution**: More sophisticated merge strategies
2. **Selective Sync**: Allow users to choose what to sync
3. **Background Sync**: Sync in background using background tasks
4. **Data Compression**: Compress sync payloads for efficiency
5. **Offline Analytics**: Track offline usage patterns

### Migration Strategy

If you need to update the database schema:

1. Update the version in `sqlite.ts`
2. Add migration logic in `createTables()`
3. Test thoroughly with existing data

## Security Considerations

- Local data is stored unencrypted by default
- Consider implementing encryption for sensitive data
- Sync operations use existing Appwrite authentication
- Network requests are secured via HTTPS

---

This offline support provides a robust foundation for the Cashbook Assist app to work reliably in any network condition while maintaining data consistency and user experience.
