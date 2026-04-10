import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface ProGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function ProGate({ children, feature }: ProGateProps) {
  const { user, isSubscribed, loading } = useAuth();

  // Show loading state or gate if not subscribed
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--bg-surface)] mb-5">
          <div className="size-8 animate-pulse rounded bg-[var(--bg-surface)]" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-[var(--bg-surface)] mx-auto" />
          <div className="h-3 w-48 animate-pulse rounded bg-[var(--bg-surface)] mx-auto" />
        </div>
      </div>
    );
  }

  if (isSubscribed) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-emphasis)]/10 mb-5">
        <Lock className="size-8 text-[var(--color-emphasis)]" />
      </div>
      <h2 className="font-display text-xl font-bold text-[var(--text-default)] mb-2">
        {feature || 'This feature'} requires Pro
      </h2>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
        Upgrade to OctoFlow Pro to access {feature?.toLowerCase() || 'this feature'} and all premium tools.
        From just £0.75/month or £5 for lifetime access.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {!user ? (
          <Link to="/auth">
            <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
              <Crown className="size-4" /> Sign In to Upgrade
            </Button>
          </Link>
        ) : (
          <Link to="/pricing">
            <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold">
              <Crown className="size-4" /> View Plans
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
