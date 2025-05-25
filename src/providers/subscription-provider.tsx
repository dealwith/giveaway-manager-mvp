'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '@app-types/subscription';

type SubscriptionProviderState = {
  subscription: Subscription | null;
  isLoading: boolean;
  isSubscribed: boolean;
  plan: SubscriptionPlan;
};

const SubscriptionContext = createContext<SubscriptionProviderState>({
  subscription: null,
  isLoading: true,
  isSubscribed: false,
  plan: SubscriptionPlan.FREE,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (status === 'loading') return;
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real app, you would fetch the subscription details from the API
        // For now, we'll use the plan from the session
        setSubscription({
          id: '',
          userId: session.user.id,
          status: SubscriptionStatus.ACTIVE,
          plan: session.user.subscriptionPlan || SubscriptionPlan.FREE,
          priceId: '',
          quantity: 1,
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [session, status]);

  const isSubscribed = subscription?.status === SubscriptionStatus.ACTIVE && subscription?.plan === SubscriptionPlan.PRO;
  const plan = subscription?.plan || SubscriptionPlan.FREE;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isSubscribed,
        plan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }

  return context;
}
