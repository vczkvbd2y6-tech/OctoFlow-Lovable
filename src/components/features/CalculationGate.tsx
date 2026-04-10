import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Calculator, ArrowRight } from 'lucide-react';

interface CalculationGateProps {
  children: React.ReactNode;
}

export default function CalculationGate({ children }: CalculationGateProps) {
  const { user, isSubscribed, canCalculate, remainingFree, calculationCount, FREE_CALCULATION_LIMIT } = useAuth();

  // Subscribed users get full access
  if (user && isSubscribed) {
    return <>{children}</>;
  }

  // Free tier exceeded — show gate
  if (!canCalculate) {
    return (
      <div className="rounded-2xl border border-[var(--color-emphasis)]/30 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-emphasis)]/10 mx-auto mb-5">
          <Lock className="size-8 text-[var(--color-emphasis)]" />
        </div>
        <h3 className="font-display text-xl font-bold text-[var(--text-default)] mb-2">
          Free Calculations Used
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6 leading-relaxed">
          You've used all {FREE_CALCULATION_LIMIT} free calculations.
          {!user
            ? ' Create an account and subscribe to unlock unlimited calculations.'
            : ' Subscribe to OctoFlow Pro for unlimited access.'}
        </p>

        <div className="grid gap-3 max-w-xs mx-auto mb-6">
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
            <Calculator className="size-3.5 text-[var(--color-accent-green)]" />
            Unlimited payback calculations
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
            <Crown className="size-3.5 text-[var(--color-accent-green)]" />
            Save and compare configurations
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]">
            <span className="text-sm font-bold text-[var(--color-emphasis)]">£0.75</span>
            <span>/month or £5 lifetime</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={user ? '/pricing' : '/auth'}>
            <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
              <Crown className="size-4" /> {user ? 'View Plans' : 'Create Account'}
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Free tier still available — show with counter
  return (
    <div>
      {!user && calculationCount > 0 && (
        <div className="mb-4 rounded-lg border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-[var(--text-subtle)]">
            <span className="font-bold text-[var(--color-emphasis)] tabular-nums">{remainingFree}</span> of {FREE_CALCULATION_LIMIT} free calculations remaining
          </p>
          <Link to="/auth" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
            Create Account
          </Link>
        </div>
      )}
      {user && !isSubscribed && (
        <div className="mb-4 rounded-lg border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-[var(--text-subtle)]">
            <span className="font-bold text-[var(--color-emphasis)] tabular-nums">{remainingFree}</span> free calculations left.
            Subscribe for unlimited access.
          </p>
          <Link to="/pricing" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
            Upgrade
          </Link>
        </div>
      )}
      {children}
    </div>
  );
}
