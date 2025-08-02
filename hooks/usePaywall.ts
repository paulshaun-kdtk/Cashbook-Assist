import { useState } from 'react';

/**
 * Hook for managing paywall modal state
 * Returns state and handlers for showing/hiding the paywall
 */
export const usePaywall = () => {
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const showPaywall = () => setShowPaywallModal(true);
  const hidePaywall = () => setShowPaywallModal(false);

  return {
    showPaywallModal,
    showPaywall,
    hidePaywall,
    setShowPaywallModal
  };
};
