import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useOctopusConnection, type CompareResult } from '@/hooks/useOctopusConnection';
import {
  Loader2, Crown, BarChart3, TrendingDown, Zap, CheckCircle2,
  AlertCircle, Calendar, ArrowRight, Lock
} from 'lucide-react';

export default function PersonalizedTariffComparison() {
  const { user, isSubscribed } = useAuth();
  const { status, loading, comparing, compareResult, compare } = useOctopusConnection();
  const [useActual, setUseActual] = useState(false);
  const [localResult, setLocalResult] = useState<CompareResult | null>(null);

  useEffect(() => {
    if (compareResult) setLocalResult(compareResult);
  }, [compareResult]);

  const handleToggle = async () => {
    const next = !useActual;
    setUseActual(next);
    if (next && !localResult) {
      try {
        await compare();
      } catch { /* toast handled in hook */ }
    }
  };

  // Non-subscriber locked state
  if (!user || !isSubscribed) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent" />
        <div className="relative flex flex-col items-center text-center py-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 mb-3">
            <Lock className="size-6 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-display text-base font-bold text-[var(--text-default)] mb-1">
            Personalized Tariff Comparison
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mb-4">
            Pro subscribers can link their Octopus Energy account to compare tariffs using real usage data. From just £0.75/month or £5 for lifetime access.
          </p>
          <Link to={user ? '/pricing' : '/auth'}>
            <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white font-semibold">
              <Crown className="size-4" /> {user ? 'Upgrade to Pro' : 'Sign In & Upgrade'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Subscriber but not connected
  if (!loading && (!status || !status.connected)) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="size-4 text-[var(--color-emphasis)]" />
          <h3 className="font-display text-sm font-bold text-[var(--text-default)]">Personalized Comparison</h3>
          <span className="rounded-full bg-[var(--color-emphasis)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-emphasis)]">PRO</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Connect your Octopus Energy account in <Link to="/account" className="text-[var(--color-primary)] underline font-medium">My Account</Link> to unlock personalized tariff comparisons based on your real electricity usage.
        </p>
        <Link to="/account">
          <Button size="sm" variant="outline" className="gap-1.5 border-[var(--border-default)]">
            <Zap className="size-3.5" /> Go to Account Settings
          </Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  // Connected subscriber — show toggle and results
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)]/60 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-[var(--color-emphasis)]" />
          <h3 className="font-display text-sm font-bold text-[var(--text-default)]">Personalized Comparison</h3>
          <span className="rounded-full bg-[var(--color-emphasis)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-emphasis)]">PRO</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-[var(--text-muted)]">Use my actual usage</span>
          <button
            role="switch"
            aria-checked={useActual}
            onClick={handleToggle}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${useActual ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-surface)] border border-[var(--border-default)]'}`}
          >
            <span className={`pointer-events-none block size-4 rounded-full bg-white shadow transform transition-transform ${useActual ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`} />
          </button>
        </label>
      </div>

      <div className="p-5">
        {!useActual ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            Toggle <strong className="text-[var(--text-subtle)]">"Use my actual usage"</strong> above to see tariff costs calculated from your imported Octopus Energy consumption data.
          </p>
        ) : comparing ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <Loader2 className="size-5 animate-spin text-[var(--color-primary)]" />
            <p className="text-xs text-[var(--text-muted)]">Calculating from your usage data...</p>
          </div>
        ) : localResult ? (
          <div className="space-y-5">
            {/* Data coverage note */}
            <div className="flex items-start gap-2 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 px-3 py-2.5">
              <Calendar className="size-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-subtle)]">
                Based on <strong>{localResult.days_of_data} days</strong> of imported data, annualized to <strong>{localResult.annualized_kwh.toLocaleString()} kWh/year</strong>.
                {localResult.detected_tariff !== 'unknown' && (
                  <> Your detected tariff: <strong className="capitalize">{localResult.detected_tariff}</strong>.</>
                )}
              </p>
            </div>

            {/* Comparison cards */}
            <div className="grid gap-3">
              {localResult.comparisons.map((comp, idx) => {
                const isCheapest = idx === 0;
                return (
                  <div
                    key={comp.value}
                    className={`rounded-lg border p-4 ${isCheapest ? 'border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/5' : 'border-[var(--border-default)] bg-[var(--bg-surface)]'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[var(--text-default)]">{comp.tariff}</span>
                        {comp.isCurrent && (
                          <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">Current</span>
                        )}
                        {isCheapest && (
                          <span className="rounded-full bg-[var(--color-accent-green)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent-green)] flex items-center gap-1">
                            <CheckCircle2 className="size-2.5" /> Cheapest
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{comp.avgRate}p/kWh avg</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">Est. Monthly</p>
                        <p className={`font-display text-lg font-bold tabular-nums ${isCheapest ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-emphasis)]'}`}>
                          £{comp.monthlyCostEstimate.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-[var(--text-muted)]">Est. Annual</p>
                        <p className={`font-display text-lg font-bold tabular-nums ${isCheapest ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-emphasis)]'}`}>
                          £{comp.annualCostEstimate.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Savings summary */}
            {localResult.potential_annual_saving !== null && localResult.potential_annual_saving > 0 && (
              <div className="rounded-lg border border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5 p-4 flex items-center gap-3">
                <TrendingDown className="size-5 text-[var(--color-accent-green)] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-accent-green)]">
                    You could save up to £{localResult.potential_annual_saving.toFixed(2)}/year
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    by switching from your current tariff to {localResult.comparisons[0]?.tariff}.
                  </p>
                </div>
              </div>
            )}

            {localResult.days_of_data < 30 && (
              <div className="flex items-start gap-2 rounded-lg bg-[var(--color-emphasis)]/5 border border-[var(--color-emphasis)]/15 px-3 py-2">
                <AlertCircle className="size-3.5 text-[var(--color-emphasis)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-muted)]">
                  Limited data ({localResult.days_of_data} days). Estimates improve with more usage history. Sync again after a few weeks for better accuracy.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="size-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No usage data available. Sync your Octopus account first.</p>
            <Link to="/account">
              <Button size="sm" variant="outline" className="gap-1.5 mt-3 border-[var(--border-default)]">
                <ArrowRight className="size-3" /> Go to Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
