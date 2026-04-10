import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, mapSupabaseUser } from '@/stores/authStore';
import { FunctionsHttpError } from '@supabase/supabase-js';

import type { SubscriptionTier } from '@/stores/authStore';

interface SubResult {
  subscribed: boolean;
  subscription_end: string | null;
  tier: SubscriptionTier;
}

async function checkSubscription(): Promise<SubResult> {
  if (!supabase) {
    return { subscribed: false, subscription_end: null, tier: 'free' };
  }
  const { data, error } = await supabase.functions.invoke('check-subscription');
  if (error) {
    let errorMessage = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const textContent = await error.context?.text();
        errorMessage = textContent || error.message;
      } catch {
        errorMessage = error.message;
      }
    }
    console.error('[useAuth] check-subscription error:', errorMessage);
    return { subscribed: false, subscription_end: null, tier: 'free' };
  }
  return {
    subscribed: data?.subscribed ?? false,
    subscription_end: data?.subscription_end ?? null,
    tier: (data?.tier as SubscriptionTier) ?? 'free',
  };
}

export function useAuth() {
  const store = useAuthStore();
  const {
    user,
    loading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    calculationCount,
    login,
    logout,
    setLoading,
    setSubscribed,
    setSubscriptionTier,
    setSubscriptionEnd,
    incrementCalculation,
  } = store;

  const FREE_CALCULATION_LIMIT = 3;
  const canCalculate = isSubscribed || calculationCount < FREE_CALCULATION_LIMIT;
  const remainingFree = Math.max(0, FREE_CALCULATION_LIMIT - calculationCount);

  const refreshSubscription = useCallback(async () => {
    if (!user) return;
    const result = await checkSubscription();
    setSubscribed(result.subscribed);
    setSubscriptionTier(result.tier);
    setSubscriptionEnd(result.subscription_end);
  }, [user, setSubscribed, setSubscriptionTier, setSubscriptionEnd]);

  return {
    user,
    loading,
    isSubscribed,
    subscriptionTier,
    subscriptionEnd,
    calculationCount,
    canCalculate,
    remainingFree,
    FREE_CALCULATION_LIMIT,
    login,
    logout,
    setLoading,
    setSubscribed,
    incrementCalculation,
    refreshSubscription,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, setLoading, logout: logoutStore, setSubscribed, setSubscriptionTier, setSubscriptionEnd } = useAuthStore();

  const refreshSub = useCallback(async () => {
    const result = await checkSubscription();
    setSubscribed(result.subscribed);
    setSubscriptionTier(result.tier);
    setSubscriptionEnd(result.subscription_end);
  }, [setSubscribed, setSubscriptionTier, setSubscriptionEnd]);

  useEffect(() => {
    if (!supabase) {
      useAuthStore.getState().setLoading(false);
      return;
    }

    let mounted = true;

    // Set a timeout to ensure loading is set to false even if session check fails
    const timeoutId = setTimeout(() => {
      if (mounted) {
        useAuthStore.getState().setLoading(false);
      }
    }, 5000); // 5 second timeout

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) {
        login(mapSupabaseUser(session.user));
        refreshSub();
      }
      if (mounted) {
        clearTimeout(timeoutId);
        useAuthStore.getState().setLoading(false);
      }
    }).catch((error) => {
      console.error('[AuthProvider] Session check failed:', error);
      if (mounted) {
        clearTimeout(timeoutId);
        useAuthStore.getState().setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          login(mapSupabaseUser(session.user));
          setLoading(false);
          refreshSub();
        } else if (event === 'SIGNED_OUT') {
          logoutStore();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          login(mapSupabaseUser(session.user));
          refreshSub();
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Check on window focus (handles returning from Stripe checkout)
  useEffect(() => {
    const handleFocus = () => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) refreshSub();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshSub]);

  // Periodic subscription check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser) refreshSub();
    }, 60_000);
    return () => clearInterval(interval);
  }, [refreshSub]);

  return <>{children}</>;
}
