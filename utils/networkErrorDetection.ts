/**
 * Network Error Detection Utility
 * Helps distinguish between network connectivity issues and other types of errors
 */

export interface NetworkErrorInfo {
  isNetworkError: boolean;
  errorType: 'network' | 'authentication' | 'server' | 'unknown';
  shouldActivateOfflineMode: boolean;
  originalError: any;
}

/**
 * Analyzes an error to determine if it's network-related
 * @param error - The error to analyze
 * @returns NetworkErrorInfo object with analysis results
 */
export function analyzeError(error: any): NetworkErrorInfo {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code;
  
  // Common network error indicators
  const networkErrorPatterns = [
    'network request failed',
    'network error',
    'connection failed',
    'fetch failed',
    'timeout',
    'unable to connect',
    'connection refused',
    'connection timeout',
    'network timeout',
    'no internet connection',
    'offline',
    'dns',
    'unreachable',
    'connection reset',
    'connection aborted',
    'socket hang up',
    'enotfound',
    'econnrefused',
    'econnreset',
    'etimedout',
    'enetunreach',
    'ehostunreach'
  ];

  // Authentication-specific error patterns (should NOT activate offline mode)
  const authErrorPatterns = [
    'unauthorized',
    'authentication failed',
    'invalid credentials',
    'session expired',
    'token expired',
    'invalid token',
    'access denied',
    'forbidden',
    'invalid session',
    'user not found',
    'invalid password',
    'account disabled'
  ];

  // Server error patterns (may or may not be network related)
  const serverErrorPatterns = [
    'internal server error',
    'service unavailable',
    'bad gateway',
    'gateway timeout',
    'server error',
    '500',
    '502',
    '503',
    '504'
  ];

  // Check for network errors first (highest priority for offline mode)
  const isNetworkError = networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );

  // Check for authentication errors (should NOT activate offline mode)
  const isAuthError = authErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );

  // Check for server errors
  const isServerError = serverErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );

  // Additional checks for specific error types
  const isTimeoutError = errorMessage.includes('timeout') || errorCode === 'TIMEOUT';
  const isFetchError = errorMessage.includes('fetch') && !isAuthError;
  const isConnectionError = errorMessage.includes('connection') && !isAuthError;

  // Determine error type and whether to activate offline mode
  let errorType: 'network' | 'authentication' | 'server' | 'unknown' = 'unknown';
  let shouldActivateOfflineMode = false;

  if (isAuthError) {
    errorType = 'authentication';
    shouldActivateOfflineMode = false; // Never activate offline mode for auth errors
  } else if (isNetworkError || isTimeoutError || isFetchError || isConnectionError) {
    errorType = 'network';
    shouldActivateOfflineMode = true; // Activate offline mode for network errors
  } else if (isServerError) {
    errorType = 'server';
    shouldActivateOfflineMode = true; // Server errors might indicate connectivity issues
  }

  return {
    isNetworkError: errorType === 'network' || shouldActivateOfflineMode,
    errorType,
    shouldActivateOfflineMode,
    originalError: error
  };
}

/**
 * Quick check if an error should activate offline mode
 * @param error - The error to check
 * @returns boolean indicating if offline mode should be activated
 */
export function shouldActivateOfflineMode(error: any): boolean {
  return analyzeError(error).shouldActivateOfflineMode;
}

/**
 * Check if the current network state supports the operation
 * @returns Promise<boolean> indicating if the network is available
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    // Try to fetch a reliable endpoint
    await fetch('https://www.google.com', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return true;
  } catch (error) {
    console.log('Network availability check failed:', error);
    return false;
  }
}

/**
 * Enhanced error handler that provides appropriate responses based on error type
 * @param error - The error to handle
 * @param context - Context information (e.g., 'session_check', 'login', etc.)
 * @returns Object with recommended action and user message
 */
export function handleErrorWithOfflineSupport(error: any, context: string = 'unknown') {
  const analysis = analyzeError(error);
  
  if (analysis.shouldActivateOfflineMode) {
    return {
      action: 'activate_offline_mode',
      message: 'Network connection unavailable. Switching to offline mode.',
      canRetry: true,
      isTemporary: true,
      analysis
    };
  } else if (analysis.errorType === 'authentication') {
    return {
      action: 'handle_auth_error',
      message: 'Authentication failed. Please sign in again.',
      canRetry: false,
      isTemporary: false,
      analysis
    };
  } else {
    return {
      action: 'show_error',
      message: 'An unexpected error occurred. Please try again.',
      canRetry: true,
      isTemporary: true,
      analysis
    };
  }
}
