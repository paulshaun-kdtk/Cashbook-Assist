/**
 * Test file for network error detection functionality
 * This file demonstrates how the network error detection works
 */

import { analyzeError, handleErrorWithOfflineSupport, shouldActivateOfflineMode } from '../networkErrorDetection';

// Test cases for network error detection
export const testNetworkErrorDetection = () => {
  console.log('🧪 Testing Network Error Detection...');

  // Test network errors (should activate offline mode)
  const networkErrors = [
    new Error('Network request failed'),
    new Error('fetch failed'),
    new Error('Connection timeout'),
    new Error('ENOTFOUND'),
    new Error('ECONNREFUSED'),
    { message: 'Unable to connect to server' },
    { message: 'Network error occurred' }
  ];

  console.log('\n📡 Network Errors (should activate offline mode):');
  networkErrors.forEach((error, index) => {
    const analysis = analyzeError(error);
    const shouldActivate = shouldActivateOfflineMode(error);
    console.log(`${index + 1}. "${error.message}" -> ${analysis.errorType} (offline: ${shouldActivate})`);
  });

  // Test authentication errors (should NOT activate offline mode)
  const authErrors = [
    new Error('Unauthorized access'),
    new Error('Authentication failed'),
    new Error('Session expired'),
    new Error('Invalid token'),
    { message: 'User not found' },
    { message: 'Access denied' }
  ];

  console.log('\n🔐 Authentication Errors (should NOT activate offline mode):');
  authErrors.forEach((error, index) => {
    const analysis = analyzeError(error);
    const shouldActivate = shouldActivateOfflineMode(error);
    console.log(`${index + 1}. "${error.message}" -> ${analysis.errorType} (offline: ${shouldActivate})`);
  });

  // Test error handling with context
  console.log('\n⚙️ Error Handling with Context:');
  const testError = new Error('Network request failed');
  const handling = handleErrorWithOfflineSupport(testError, 'session_check');
  console.log('Network error handling:', handling);

  const authError = new Error('Unauthorized');
  const authHandling = handleErrorWithOfflineSupport(authError, 'session_check');
  console.log('Auth error handling:', authHandling);

  console.log('\n✅ Network error detection tests completed!');
};

// Example usage in components
export const exampleUsageInAuth = async () => {
  try {
    // Simulate an API call that might fail
    throw new Error('fetch failed');
  } catch (error) {
    const errorResponse = handleErrorWithOfflineSupport(error, 'session_check');
    
    switch (errorResponse.action) {
      case 'activate_offline_mode':
        console.log('🔄 Activating offline mode:', errorResponse.message);
        // Keep user logged in, show offline indicator
        break;
        
      case 'handle_auth_error':
        console.log('🔐 Authentication error:', errorResponse.message);
        // Clear user session, redirect to login
        break;
        
      case 'show_error':
        console.log('⚠️ General error:', errorResponse.message);
        // Show error message, allow retry
        break;
    }
  }
};

// Test the complete authentication flow
export const testAuthFlow = async () => {
  console.log('🔄 Testing Authentication Flow...');
  
  // Simulate different error scenarios
  const scenarios = [
    { name: 'Network Timeout', error: new Error('Connection timeout') },
    { name: 'DNS Failure', error: new Error('ENOTFOUND api.example.com') },
    { name: 'Connection Refused', error: new Error('ECONNREFUSED') },
    { name: 'Fetch Failed', error: new Error('fetch failed') },
    { name: 'Session Expired', error: new Error('Session expired') },
    { name: 'Unauthorized', error: new Error('Unauthorized access') },
    { name: 'Invalid Token', error: new Error('Invalid token') }
  ];
  
  scenarios.forEach(scenario => {
    const analysis = analyzeError(scenario.error);
    const response = handleErrorWithOfflineSupport(scenario.error, 'session_check');
    
    console.log(`\n📋 Scenario: ${scenario.name}`);
    console.log(`   Error Type: ${analysis.errorType}`);
    console.log(`   Action: ${response.action}`);
    console.log(`   Message: ${response.message}`);
    console.log(`   Offline Mode: ${analysis.shouldActivateOfflineMode}`);
  });
};

// Export test functions for manual testing
export default {
  testNetworkErrorDetection,
  exampleUsageInAuth,
  testAuthFlow
};
