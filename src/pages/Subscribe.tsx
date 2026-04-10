import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Crown, Check, Zap, Calculator, BookmarkCheck, BarChart3, Shield, Loader2, ExternalLink } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';

export default function Subscribe() {
  const { user, isSubscribed, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Handle checkout=cancelled param
  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      toast({ variant: 'destructive', title: 'Checkout cancelled', description: 'You can try again anytime.' });
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-checkout');
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
      setLoading(false);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
      return; // Don't reset loading — navigating away
    }
    setLoading(false);
  };

  if (isSubscribed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-accent-green)]/10 mb-5">
          <Check className="size-8 text-[var(--color-accent-green)]" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)] mb-2">You're on Pro!</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">You have unlimited access to all OctoFlow features.</p>
        <Link to="/calculator">
          <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
            <Calculator className="size-4" /> Go to Calculator
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
      <div className="text-center mb-8">
        <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-emphasis)] to-[var(--color-primary)] mx-auto mb-4">
          <Crown className="size-7 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)] mb-2">OctoFlow Pro</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Unlock the full power of solar payback modelling
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-emphasis)]/30 bg-[var(--bg-elevated)] overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-emphasis)]/10 to-[var(--color-primary)]/10 px-6 py-5 text-center border-b border-[var(--color-emphasis)]/20">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-4xl font-bold text-[var(--color-emphasis)]">£1.75</span>
            <span className="text-sm text-[var(--text-muted)]">/month</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Cancel anytime. No commitment.</p>
        </div>

        <div className="p-6 space-y-4">
          {[
            { icon: Calculator, label: 'Unlimited payback calculations' },
            { icon: BookmarkCheck, label: 'Save and compare configurations' },
            { icon: BarChart3, label: 'Side-by-side system comparisons' },
            { icon: Zap, label: 'Live Octopus Agile rate integration' },
            { icon: Shield, label: 'Priority updates and new features' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-accent-green)]/10">
                <f.icon className="size-4 text-[var(--color-accent-green)]" />
              </div>
              <span className="text-sm text-[var(--text-default)]">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="p-6 pt-0">
          {!user ? (
            <div className="space-y-3">
              <Link to="/auth">
                <Button className="w-full gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold" size="lg">
                  Create Account First
                </Button>
              </Link>
              <p className="text-center text-xs text-[var(--text-muted)]">
                You need an account before subscribing
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                className="w-full gap-2 bg-gradient-to-r from-[var(--color-emphasis)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Crown className="size-4" />
                )}
                Subscribe Now — £1.75/month
                {!loading && <ExternalLink className="size-3.5 ml-1" />}
              </Button>
              <p className="text-center text-xs text-[var(--text-muted)]">
                Secure payment via Stripe. Opens in a new tab.
              </p>
              <button
                onClick={refreshSubscription}
                className="w-full text-center text-xs text-[var(--color-primary)] hover:underline"
              >
                Already subscribed? Refresh status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
