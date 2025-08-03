import { RootState } from '@/redux/store';
import { subscriptionValidationService, ValidationResult } from '@/services/subscription/subscriptionValidationService';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppwriteSubscriptionListener } from './useAppwriteSubscriptionListener';

export const useSubscriptionValidation = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);
  
  // Extract user email for dependency tracking
  const userEmail = (user as any)?.email;

  // Start Appwrite subscription listener for manual changes
  const { isListening } = useAppwriteSubscriptionListener();

  // Manual validation trigger - use useCallback with stable dependencies
  const validateNow = useCallback(async () => {
    if (!userEmail) {
      console.log('No user email available for validation');
      return;
    }

    setIsValidating(true);
    try {
      const result = await subscriptionValidationService.validateUserSubscription(userEmail);
      setValidationResult(result);
      setLastValidationTime(new Date());

      // Don't show toast here to avoid dependency loop - let the listener handle it
      if (result.error) {
        console.error('Subscription validation failed:', result.error);
      }
    } catch (error) {
      console.error('Error during manual validation:', error);
    } finally {
      setIsValidating(false);
    }
  }, [userEmail]);

  // Set up validation listener and periodic validation
  useEffect(() => {
    if (!userEmail) return;

    // Listen for validation results
    const removeListener = subscriptionValidationService.addValidationListener((result) => {
      setValidationResult(result);
      setLastValidationTime(new Date());
    });

    // Start periodic validation
    subscriptionValidationService.startPeriodicValidation();

    // Initial validation if needed
    if (subscriptionValidationService.shouldValidate()) {
      // Call validation directly to avoid dependency loop
      subscriptionValidationService.validateUserSubscription(userEmail).then((result) => {
        setValidationResult(result);
        setLastValidationTime(new Date());
      }).catch(error => {
        console.error('Initial validation failed:', error);
      });
    } else {
      // Get last validation time
      const lastTime = subscriptionValidationService.getLastValidationTime();
      if (lastTime) {
        setLastValidationTime(lastTime);
      }
    }

    return () => {
      removeListener();
      // Don't stop periodic validation here as other components might be using it
    };
  }, [userEmail]); // Removed validateNow from dependencies

  // Stop validation when component unmounts (if no user)
  useEffect(() => {
    return () => {
      if (!userEmail) {
        subscriptionValidationService.stopPeriodicValidation();
      }
    };
  }, [userEmail]);

  return {
    validationResult,
    isValidating,
    lastValidationTime,
    validateNow,
    hasActiveSubscription: validationResult?.hasActiveSubscription ?? false,
    isValidationValid: validationResult?.isValid ?? false,
    syncedWithAppwrite: validationResult?.syncedWithAppwrite ?? false,
    appwriteListenerActive: isListening
  };
};
