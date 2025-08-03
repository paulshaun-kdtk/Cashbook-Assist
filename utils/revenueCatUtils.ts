import Purchases from 'react-native-purchases';

/**
 * Utility to check RevenueCat configuration status
 */
export const revenueCatUtils = {
  /**
   * Check if RevenueCat is properly configured
   */
  async checkConfiguration(): Promise<{
    isConfigured: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      const isConfigured = await Purchases.isConfigured();
      
      if (isConfigured) {
        try {
          // Try to get customer info to verify it's working
          const customerInfo = await Purchases.getCustomerInfo();
          return {
            isConfigured: true,
            details: {
              originalAppUserId: customerInfo.originalAppUserId,
              hasActiveEntitlements: Object.keys(customerInfo.entitlements.active).length > 0,
              activeEntitlements: Object.keys(customerInfo.entitlements.active)
            }
          };
        } catch (customerError: any) {
          return {
            isConfigured: true,
            error: `RevenueCat configured but customer info failed: ${customerError.message}`,
            details: { customerInfoError: customerError.message }
          };
        }
      } else {
        return {
          isConfigured: false,
          error: 'RevenueCat not configured'
        };
      }
    } catch (error: any) {
      return {
        isConfigured: false,
        error: `RevenueCat check failed: ${error.message}`
      };
    }
  },

  /**
   * Initialize RevenueCat with retry logic
   */
  async initializeWithRetry(apiKey: string, maxRetries = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await Purchases.configure({ apiKey });
        const isConfigured = await Purchases.isConfigured();
        
        if (isConfigured) {
          console.log(`✅ RevenueCat configured successfully on attempt ${i + 1}`);
          return true;
        } else {
          console.warn(`⚠️ RevenueCat configuration attempt ${i + 1} failed`);
        }
      } catch (error: any) {
        console.error(`❌ RevenueCat configuration attempt ${i + 1} error:`, error.message);
        
        if (i === maxRetries - 1) {
          console.error('🚨 RevenueCat configuration failed after all attempts');
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    return false;
  },

  /**
   * Wait for RevenueCat to be configured (useful for startup)
   */
  async waitForConfiguration(timeoutMs = 10000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const isConfigured = await Purchases.isConfigured();
        if (isConfigured) {
          console.log('✅ RevenueCat is now configured');
          return true;
        }
      } catch {
        // Ignore errors during waiting
      }
      
      // Wait 500ms before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.warn('⚠️ Timeout waiting for RevenueCat configuration');
    return false;
  }
};

export default revenueCatUtils;
