# Offline-Aware Authentication

This document explains how the authentication system has been enhanced to support offline mode when network errors occur during session checking.

## Overview

The authentication system now distinguishes between network connectivity issues and actual authentication failures. When a network error occurs during session validation, the app activates offline mode instead of logging the user out, allowing them to continue using the app with locally stored data.

## Key Components

### 1. Network Error Detection (`utils/networkErrorDetection.ts`)

A comprehensive utility that analyzes errors to determine their type:

- **Network Errors**: Connection timeouts, DNS failures, fetch errors, etc.
- **Authentication Errors**: Invalid credentials, expired sessions, unauthorized access
- **Server Errors**: 5xx responses, service unavailable, etc.

```typescript
import { analyzeError, shouldActivateOfflineMode } from '@/utils/networkErrorDetection';

const errorAnalysis = analyzeError(error);
if (errorAnalysis.shouldActivateOfflineMode) {
  // Handle as network error - activate offline mode
} else {
  // Handle as authentication error - require re-login
}
```

### 2. Enhanced Authentication Flow

#### `initAuth()` Function
- Checks stored authentication data on app startup
- If session verification fails due to network error, keeps user authenticated using stored data
- Only clears authentication for actual authentication failures

#### `checkSessionThunk()`
- Validates current session with remote server
- Returns enhanced error information including error type
- Attempts to restore from stored auth data on network errors

### 3. Auth Slice Updates

The Redux auth slice now handles different error types:

```typescript
.addCase(checkSessionThunk.rejected, (state, action) => {
  const payload = action.payload as any;
  
  if (payload?.error === 'network_error') {
    // Network error - don't clear user, activate offline mode
    state.error = payload;
  } else {
    // Authentication error - clear user
    state.user = null;
    state.error = payload;
  }
})
```

## Error Types and Responses

### Network Errors
**Triggers**: Connection timeout, DNS failure, fetch errors, server unavailability

**Response**:
- Keep user authenticated using stored data
- Activate offline mode indicator
- Allow app to continue functioning with local data
- Show informative message about offline mode

**Example Error Patterns**:
- "network request failed"
- "connection timeout" 
- "fetch failed"
- "ENOTFOUND", "ECONNREFUSED"

### Authentication Errors
**Triggers**: Invalid credentials, expired tokens, unauthorized access

**Response**:
- Clear user authentication
- Redirect to login screen
- Show authentication error message
- Require user to sign in again

**Example Error Patterns**:
- "unauthorized"
- "authentication failed"
- "session expired"
- "invalid token"

### Server Errors
**Triggers**: 5xx responses, service temporarily unavailable

**Response**:
- May activate offline mode (treated as potential network issue)
- Preserve user session when possible
- Allow retry when connection is restored

## Usage Examples

### In Components

```typescript
import { useToast } from '@/hooks/useToast';

// In signin screen or other auth components
useEffect(() => {
  const checkSession = async () => {
    try {
      const result = await dispatch(checkSessionThunk()).unwrap();
      // Session valid, proceed normally
    } catch (error: any) {
      if (error?.error === 'network_error') {
        showToast({ 
          type: 'info', 
          text1: 'Offline Mode', 
          text2: 'Working offline. Some features may be limited.' 
        });
      } else if (error?.error === 'authentication_error') {
        // Handle authentication failure
        showToast({ 
          type: 'error', 
          text1: 'Session Expired', 
          text2: 'Please sign in again.' 
        });
      }
    }
  };
  
  checkSession();
}, []);
```

### Custom Error Handling

```typescript
import { handleErrorWithOfflineSupport } from '@/utils/networkErrorDetection';

try {
  // Some API call
  await someApiCall();
} catch (error) {
  const errorResponse = handleErrorWithOfflineSupport(error, 'api_call');
  
  switch (errorResponse.action) {
    case 'activate_offline_mode':
      // Switch to offline mode
      break;
    case 'handle_auth_error':
      // Redirect to login
      break;
    case 'show_error':
      // Show generic error
      break;
  }
}
```

## Integration with Existing Offline Support

This enhancement works seamlessly with the existing offline infrastructure:

- **SQLite Database**: Stores local data for offline access
- **Offline Indicator**: Shows current connectivity and sync status
- **Sync Service**: Syncs data when connection is restored
- **Offline Middleware**: Routes actions to local storage when offline

## Benefits

1. **Better User Experience**: Users don't get logged out due to temporary network issues
2. **Data Preservation**: User sessions are maintained during connectivity problems
3. **Seamless Transition**: Automatic switching between online and offline modes
4. **Smart Error Handling**: Distinguishes between network and authentication issues
5. **Offline Productivity**: Users can continue working with local data

## Testing Scenarios

### Network Error Scenarios
- Turn off WiFi during app startup
- Use airplane mode while app is running
- Simulate network timeout during session check
- Test with unstable network connection

### Authentication Error Scenarios
- Use expired or invalid session tokens
- Test with revoked user permissions
- Simulate server-side authentication failures

### Expected Behaviors
- Network errors should activate offline mode and preserve user session
- Authentication errors should clear session and require re-login
- App should automatically sync when connection is restored
- Offline indicator should show appropriate status

## Configuration

No additional configuration is required. The network error detection works automatically based on error patterns and standard network error codes.

The system is designed to be conservative - when in doubt, it tends to preserve user sessions and activate offline mode rather than forcing re-authentication.

## Future Enhancements

1. **Retry Logic**: Implement exponential backoff for network errors
2. **Manual Retry**: Allow users to manually retry failed operations
3. **Detailed Error Messages**: More specific error messages based on error type
4. **Analytics**: Track network error patterns for app improvement
5. **Progressive Sync**: Smart syncing based on connection quality
