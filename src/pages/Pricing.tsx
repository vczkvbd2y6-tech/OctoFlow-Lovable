import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, Calculator, BookmarkCheck, BarChart3, Shield, Loader2, ExternalLink, Infinity, Target } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';

export default function Pricing() {
  const { user, isSubscribed, subscriptionTier, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      toast({ variant: 'destructive', title: 'Checkout cancelled', description: 'You can try again anytime.' });
    }
  }, [searchParams]);

  const handleCheckout = async (plan: 'pro_monthly' | 'pro_lifetime') => {
    if (!user) return;
    setLoadingPlan(plan);
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: { plan } });
    if (error) {
      let errorMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const textContent = await error.context?.text();
          const parsed = JSON.parse(textContent || '{}');
          errorMessage = parsed.error || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      toast({ variant: 'destructive', title: 'Checkout error', description: errorMessage });
      setLoadingPlan(null);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    setLoadingPlan(null);
  };

  if (isSubscribed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-accent-green)]/10 mb-5">
          <Check className="size-8 text-[var(--color-accent-green)]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)] mb-2">
          {subscriptionTier === 'pro_lifetime' ? "You're a Lifetime Pro!" : "You're on Pro!"}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">You have unlimited access to all OctoFlow features.</p>
        <Link to="/calculator">
          <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
            <Calculator className="size-4" /> Go to Calculator
          </Button>
        </Link>
      </div>
    );
  }

  const features = [
    { icon: Calculator, label: 'Unlimited payback calculations' },
    { icon: BookmarkCheck, label: 'Save and compare configurations' },
    { icon: BarChart3, label: 'Side-by-side system comparisons' },
    { icon: Target, label: 'Live system payback tracker' },
    { icon: Zap, label: 'Octopus Energy account linking' },
    { icon: Shield, label: 'Priority updates and new features' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="text-center mb-10">
        <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-emphasis)] to-[var(--color-primary)] mx-auto mb-4">
          <Crown className="size-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)] mb-2">OctoFlow Pro</h1>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Unlock the full power of solar payback modelling with Pro features
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {/* Monthly */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="bg-[var(--bg-surface)] px-6 py-5 text-center border-b border-[var(--border-default)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Monthly</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-display text-4xl font-bold text-[var(--color-emphasis)]">£0.75</span>
              <span className="text-sm text-[var(--text-muted)]">/month</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Cancel anytime</p>
          </div>
          <div className="p-6">
            {!user ? (
              <Link to="/auth">
                <Button className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold" size="lg">
                  Create Account First
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
                size="lg"
                onClick={() => handleCheckout('pro_monthly')}
                disabled={!!loadingPlan}
              >
                {loadingPlan === 'pro_monthly' ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
                Subscribe — £0.75/mo
              </Button>
            )}
          </div>
        </div>

        {/* Lifetime */}
        <div className="rounded-2xl border-2 border-[var(--color-emphasis)]/40 bg-[var(--bg-elevated)] overflow-hidden relative">
          <div className="absolute top-3 right-3 rounded-full bg-[var(--color-emphasis)] px-2.5 py-1 text-[10px] font-bold text-white uppercase">Best Value</div>
          <div className="bg-gradient-to-r from-[var(--color-emphasis)]/10 to-[var(--color-primary)]/10 px-6 py-5 text-center border-b border-[var(--color-emphasis)]/20">
            <p className="text-xs font-semibold text-[var(--color-emphasis)] uppercase mb-2">Lifetime</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-display text-4xl font-bold text-[var(--color-emphasis)]">£5</span>
              <span className="text-sm text-[var(--text-muted)]">one-time</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center justify-center gap-1">
              <Infinity className="size-3" /> Permanent access
            </p>
          </div>
          <div className="p-6">
            {!user ? (
              <Link to="/auth">
                <Button className="w-full gap-2 bg-gradient-to-r from-[var(--color-emphasis)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold" size="lg">
                  Create Account First
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full gap-2 bg-gradient-to-r from-[var(--color-emphasis)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
                size="lg"
                onClick={() => handleCheckout('pro_lifetime')}
                disabled={!!loadingPlan}
              >
                {loadingPlan === 'pro_lifetime' ? <Loader2 className="size-4 animate-spin" /> : <Infinity className="size-4" />}
                Buy Lifetime — £5
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features list */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
        <h3 className="font-display text-sm font-bold text-[var(--text-default)] mb-4 text-center">All Pro features</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent-green)]/10">
                <f.icon className="size-4 text-[var(--color-accent-green)]" />
              </div>
              <span className="text-sm text-[var(--text-default)]">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="text-center mt-6">
          <button
            onClick={refreshSubscription}
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            Already paid? Refresh status
          </button>
        </div>
      )}
    </div>
  );
}
