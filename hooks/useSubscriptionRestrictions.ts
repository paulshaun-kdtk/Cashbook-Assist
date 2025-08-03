import { RootState } from '@/redux/store';
import { getCounts } from '@/services/subscription/selectors';
import { subscriptionService } from '@/services/subscription/subscriptionService';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface RestrictionCheck {
  allowed: boolean;
  message?: string;
  loading: boolean;
}

export const useSubscriptionRestrictions = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const companiesCount = useSelector((state: RootState) => getCounts.companies(state));
  const cashbooksCount = useSelector((state: RootState) => getCounts.cashbooks(state));
  const transactionsCount = useSelector((state: RootState) => getCounts.transactions(state));

  const [companyRestriction, setCompanyRestriction] = useState<RestrictionCheck>({ allowed: true, loading: true });
  const [cashbookRestriction, setCashbookRestriction] = useState<RestrictionCheck>({ allowed: true, loading: true });
  const [transactionRestriction, setTransactionRestriction] = useState<RestrictionCheck>({ allowed: true, loading: true });

  const checkRestrictions = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    try {
      console.log('🔍 useSubscriptionRestrictions: Checking restrictions', { forceRefresh });
      
      // If force refresh, clear cache first
      if (forceRefresh) {
        subscriptionService.clearCache();
      }

      // Check company restrictions
      const companyCheck = await subscriptionService.canCreateCompany(user, companiesCount);
      setCompanyRestriction({ ...companyCheck, loading: false });

      // Check cashbook restrictions
      const cashbookCheck = await subscriptionService.canCreateCashbook(user, cashbooksCount);
      setCashbookRestriction({ ...cashbookCheck, loading: false });

      // Check transaction restrictions
      const transactionCheck = await subscriptionService.canCreateTransaction(user, transactionsCount);
      setTransactionRestriction({ ...transactionCheck, loading: false });
      
      console.log('✅ useSubscriptionRestrictions: Restrictions updated', {
        company: companyCheck.allowed,
        cashbook: cashbookCheck.allowed,
        transaction: transactionCheck.allowed
      });

    } catch (error) {
      console.error('❌ useSubscriptionRestrictions: Error checking restrictions:', error);
      // Default to allowing on error
      setCompanyRestriction({ allowed: true, loading: false });
      setCashbookRestriction({ allowed: true, loading: false });
      setTransactionRestriction({ allowed: true, loading: false });
    }
  }, [user, companiesCount, cashbooksCount, transactionsCount]);

  useEffect(() => {
    checkRestrictions();
  }, [checkRestrictions]);

  // Set up periodic refresh to catch subscription changes
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      console.log('⏰ useSubscriptionRestrictions: Periodic refresh');
      checkRestrictions(true); // Force refresh to bypass cache
    }, 60000); // Refresh every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, checkRestrictions]);

  return {
    canCreateCompany: companyRestriction,
    canCreateCashbook: cashbookRestriction,
    canCreateTransaction: transactionRestriction,
    counts: {
      companies: companiesCount,
      cashbooks: cashbooksCount,
      transactions: transactionsCount
    },
    refreshRestrictions: () => checkRestrictions(true)
  };
};
