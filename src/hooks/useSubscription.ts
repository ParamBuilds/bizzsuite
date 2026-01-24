import { useState, useEffect } from 'react';
import { getSubscriptionInfo, SubscriptionInfo, canAccessFeature, PremiumFeature } from '@/lib/subscription';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const info = await getSubscriptionInfo();
        setSubscription(info);
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const checkFeature = async (feature: PremiumFeature): Promise<boolean> => {
    return canAccessFeature(feature);
  };

  const refresh = async () => {
    setLoading(true);
    const info = await getSubscriptionInfo();
    setSubscription(info);
    setLoading(false);
  };

  return {
    subscription,
    loading,
    checkFeature,
    refresh,
    isPremium: subscription?.status === 'active',
    isTrial: subscription?.status === 'trial',
    isExpired: subscription?.status === 'expired'
  };
}
