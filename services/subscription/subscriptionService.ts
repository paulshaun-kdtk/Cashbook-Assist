import { confirmHasSubscription } from '@/redux/appwrite/auth/userActions';

export interface SubscriptionLimits {
  maxCompanies: number;
  maxCashbooks: number;
  maxTransactions: number;
}

export interface UserSubscriptionStatus {
  isFreeTrial: boolean;
  isPremium: boolean;
  subscriptionStatus: 'pending' | 'active' | 'cancelled' | 'expired' | 'none';
  limits: SubscriptionLimits;
  timeRemaining?: number;
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private cachedStatus: UserSubscriptionStatus | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  private getFreeTrialLimits(): SubscriptionLimits {
    return {
      maxCompanies: 1,
      maxCashbooks: 1,
      maxTransactions: 1000
    };
  }

  private getPremiumLimits(): SubscriptionLimits {
    return {
      maxCompanies: -1, // Unlimited
      maxCashbooks: -1, // Unlimited
      maxTransactions: -1 // Unlimited
    };
  }

  async getUserSubscriptionStatus(user: any): Promise<UserSubscriptionStatus> {
    // Check cache first
    const now = Date.now();
    if (this.cachedStatus && (now - this.cacheTimestamp) < this.cacheExpiryMs) {
      return this.cachedStatus;
    }

    try {
      // Use the user's email from their session
      const userEmail = user?.email;
      if (!userEmail) {
        throw new Error('User email not found in session');
      }

      const subscriptionResult = await confirmHasSubscription(userEmail);
      
      let status: UserSubscriptionStatus;

      if (subscriptionResult.success) {
        if (subscriptionResult.free_trial) {
          status = {
            isFreeTrial: true,
            isPremium: false,
            subscriptionStatus: 'pending',
            limits: this.getFreeTrialLimits(),
            timeRemaining: subscriptionResult.time_remaining
          };
        } else {
          status = {
            isFreeTrial: false,
            isPremium: true,
            subscriptionStatus: 'active',
            limits: this.getPremiumLimits()
          };
        }
      } else {
        // No subscription found - treat as free trial
        status = {
          isFreeTrial: true,
          isPremium: false,
          subscriptionStatus: 'none',
          limits: this.getFreeTrialLimits()
        };
      }

      // Cache the result
      this.cachedStatus = status;
      this.cacheTimestamp = now;

      return status;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      
      // Default to free trial limits on error
      const defaultStatus: UserSubscriptionStatus = {
        isFreeTrial: true,
        isPremium: false,
        subscriptionStatus: 'none',
        limits: this.getFreeTrialLimits()
      };

      return defaultStatus;
    }
  }

  async canCreateCompany(user: any, currentCompanyCount: number): Promise<{ allowed: boolean; message?: string }> {
    const subscriptionStatus = await this.getUserSubscriptionStatus(user);
    
    if (subscriptionStatus.isPremium || subscriptionStatus.limits.maxCompanies === -1) {
      return { allowed: true };
    }

    if (currentCompanyCount >= subscriptionStatus.limits.maxCompanies) {
      return {
        allowed: false,
        message: `Free trial is limited to ${subscriptionStatus.limits.maxCompanies} company. Upgrade to Premium for unlimited companies.`
      };
    }

    return { allowed: true };
  }

  async canCreateCashbook(user: any, currentCashbookCount: number): Promise<{ allowed: boolean; message?: string }> {
    const subscriptionStatus = await this.getUserSubscriptionStatus(user);
    
    if (subscriptionStatus.isPremium || subscriptionStatus.limits.maxCashbooks === -1) {
      return { allowed: true };
    }

    if (currentCashbookCount >= subscriptionStatus.limits.maxCashbooks) {
      return {
        allowed: false,
        message: `Free trial is limited to ${subscriptionStatus.limits.maxCashbooks} cashbook. Upgrade to Premium for unlimited cashbooks.`
      };
    }

    return { allowed: true };
  }

  async canCreateTransaction(user: any, currentTransactionCount: number): Promise<{ allowed: boolean; message?: string }> {
    const subscriptionStatus = await this.getUserSubscriptionStatus(user);
    
    if (subscriptionStatus.isPremium || subscriptionStatus.limits.maxTransactions === -1) {
      return { allowed: true };
    }

    if (currentTransactionCount >= subscriptionStatus.limits.maxTransactions) {
      return {
        allowed: false,
        message: `Free trial is limited to ${subscriptionStatus.limits.maxTransactions} transactions. Upgrade to Premium for unlimited transactions.`
      };
    }

    return { allowed: true };
  }

  clearCache(): void {
    this.cachedStatus = null;
    this.cacheTimestamp = 0;
  }
}

export const subscriptionService = SubscriptionService.getInstance();
