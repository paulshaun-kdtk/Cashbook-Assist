import { RootState } from '@/redux/store';
import { AppwriteSubscriptionChange, appwriteSubscriptionListener } from '@/services/subscription/appwriteSubscriptionListener';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from './useToast';

export const useAppwriteSubscriptionListener = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const userEmail = (user as any)?.email;

  useEffect(() => {
    if (!userEmail) return;

    // Add listener for subscription changes
    const removeChangeListener = appwriteSubscriptionListener.addChangeListener((change: AppwriteSubscriptionChange) => {
      console.log('Appwrite subscription change detected:', change);
      
      // Show appropriate notifications to user
      switch (change.type) {
        case 'manual_upgrade':
          showToast({
            type: 'success',
            text1: 'Account Upgraded!',
            text2: 'Your subscription has been activated. Welcome to Premium!'
          });
          break;
        
        case 'manual_downgrade':
          showToast({
            type: 'info',
            text1: 'Subscription Updated',
            text2: 'Your subscription status has changed. Some features may be limited.'
          });
          break;
        
        case 'admin_action':
          showToast({
            type: 'info',
            text1: 'Account Updated',
            text2: 'Your subscription has been updated by support.'
          });
          break;
      }
    });

    // Start listening for changes
    appwriteSubscriptionListener.startListening(userEmail);

    return () => {
      removeChangeListener();
      // Don't stop listening here as other components might be using it
    };
  }, [userEmail, showToast]);

  // Stop listening when user logs out
  useEffect(() => {
    return () => {
      if (!userEmail) {
        appwriteSubscriptionListener.stopListening();
      }
    };
  }, [userEmail]);

  return {
    isListening: appwriteSubscriptionListener.isCurrentlyListening()
  };
};
