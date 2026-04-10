import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_lifetime';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  calculationCount: number;
  login: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setSubscribed: (subscribed: boolean) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setSubscriptionEnd: (end: string | null) => void;
  incrementCalculation: () => void;
  resetCalculationCount: () => void;
}

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export { mapSupabaseUser };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      isSubscribed: false,
      subscriptionTier: 'free',
      subscriptionEnd: null,
      calculationCount: 0,

      login: (user) => set({ user }),
      logout: () => {
        if (supabase) {
          supabase.auth.signOut();
        }
        set({ user: null, isSubscribed: false, subscriptionTier: 'free', subscriptionEnd: null });
      },
      setLoading: (loading) => set({ loading }),
      setSubscribed: (subscribed) => set({ isSubscribed: subscribed }),
      setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
      setSubscriptionEnd: (end) => set({ subscriptionEnd: end }),
      incrementCalculation: () => set((state) => ({ calculationCount: state.calculationCount + 1 })),
      resetCalculationCount: () => set({ calculationCount: 0 }),
    }),
    {
      name: 'octoflow-auth',
      partialize: (state) => ({
        calculationCount: state.calculationCount,
      }),
    }
  )
);
