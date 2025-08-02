import { RootState } from '@/redux/store';
import { getCounts } from '@/services/subscription/selectors';
import { subscriptionService } from '@/services/subscription/subscriptionService';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const checkRestrictions = async () => {
      if (!user) return;

      try {
        // Check company restrictions
        const companyCheck = await subscriptionService.canCreateCompany(user, companiesCount);
        setCompanyRestriction({ ...companyCheck, loading: false });

        // Check cashbook restrictions
        const cashbookCheck = await subscriptionService.canCreateCashbook(user, cashbooksCount);
        setCashbookRestriction({ ...cashbookCheck, loading: false });

        // Check transaction restrictions
        const transactionCheck = await subscriptionService.canCreateTransaction(user, transactionsCount);
        setTransactionRestriction({ ...transactionCheck, loading: false });

      } catch (error) {
        console.error('Error checking restrictions:', error);
        // Default to allowing on error
        setCompanyRestriction({ allowed: true, loading: false });
        setCashbookRestriction({ allowed: true, loading: false });
        setTransactionRestriction({ allowed: true, loading: false });
      }
    };

    checkRestrictions();
  }, [user, companiesCount, cashbooksCount, transactionsCount]);

  return {
    canCreateCompany: companyRestriction,
    canCreateCashbook: cashbookRestriction,
    canCreateTransaction: transactionRestriction,
    counts: {
      companies: companiesCount,
      cashbooks: cashbooksCount,
      transactions: transactionsCount
    }
  };
};
