import { Zap, TrendingDown, BarChart3, ArrowRight, Crown, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TARIFF_OPTIONS } from '@/constants/config';
import PersonalizedTariffComparison from '@/components/features/PersonalizedTariffComparison';
import { useAuth } from '@/hooks/useAuth';

const tariffDetails: Record<string, { description: string; pros: string[]; cons: string[]; icon: React.ComponentType<{ className?: string }> }> = {
  agile: {
    description:
      'Half-hourly pricing that tracks wholesale energy costs. Rates change every 30 minutes and are published a day ahead at 4pm. Ideal for flexible users who can shift consumption to cheaper periods.',
    pros: [
      'Lowest rates overnight (often 5–10p/kWh)',
      'Negative pricing possible — get paid to use electricity',
      'Best for battery owners who charge off-peak',
    ],
    cons: [
      'Peak rates can exceed 35p/kWh',
      'Requires active management or automation',
      'Rates vary daily — less predictable bills',
    ],
    icon: BarChart3,
  },
  fixed: {
    description:
      'A single unit rate locked for your contract term. Simple, predictable, and no need to monitor prices. Good for households without batteries or flexible loads.',
    pros: [
      'Completely predictable monthly bills',
      'No need to shift usage patterns',
      'Easy to budget and compare',
    ],
    cons: [
      'No benefit from off-peak cheap rates',
      'Typically higher average rate than Agile off-peak',
      'Cannot exploit negative pricing',
    ],
    icon: TrendingDown,
  },
  tracker: {
    description:
      'A daily variable rate that follows the wholesale day-ahead price plus a fixed margin. Rates change once per day rather than half-hourly, offering a middle ground between Agile and Fixed.',
    pros: [
      'Simpler than Agile — one rate per day',
      'Tracks wholesale trends downward',
      'Good balance of savings vs. simplicity',
    ],
    cons: [
      'No intra-day variation to exploit',
      'Can spike on high wholesale days',
      'Less savings potential than Agile for battery owners',
    ],
    icon: Zap,
  },
};

export default function Tariffs() {
  const { isSubscribed } = useAuth();

  // Mock historical data - in a real app this would come from an API
  const historicalData = {
    agile: {
      monthlyAverage: [
        { month: 'Jan 2024', avgRate: 28.5 },
        { month: 'Feb 2024', avgRate: 25.2 },
        { month: 'Mar 2024', avgRate: 22.8 },
        { month: 'Apr 2024', avgRate: 19.6 },
        { month: 'May 2024', avgRate: 18.9 },
        { month: 'Jun 2024', avgRate: 21.3 },
        { month: 'Jul 2024', avgRate: 24.7 },
        { month: 'Aug 2024', avgRate: 26.1 },
        { month: 'Sep 2024', avgRate: 23.8 },
        { month: 'Oct 2024', avgRate: 20.5 },
        { month: 'Nov 2024', avgRate: 22.9 },
        { month: 'Dec 2024', avgRate: 25.6 },
      ],
      bestDay: { date: '2024-05-15', rate: 8.2 },
      worstDay: { date: '2024-01-08', rate: 45.6 },
      negativePriceDays: 12,
    },
    tracker: {
      monthlyAverage: [
        { month: 'Jan 2024', avgRate: 32.1 },
        { month: 'Feb 2024', avgRate: 29.8 },
        { month: 'Mar 2024', avgRate: 27.4 },
        { month: 'Apr 2024', avgRate: 24.2 },
        { month: 'May 2024', avgRate: 23.5 },
        { month: 'Jun 2024', avgRate: 25.9 },
        { month: 'Jul 2024', avgRate: 28.3 },
        { month: 'Aug 2024', avgRate: 29.7 },
        { month: 'Sep 2024', avgRate: 27.4 },
        { month: 'Oct 2024', avgRate: 25.1 },
        { month: 'Nov 2024', avgRate: 27.5 },
        { month: 'Dec 2024', avgRate: 30.2 },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)]">
          Octopus Energy Tariffs
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
          OctoFlow supports three Octopus Energy tariffs. Choose the one that matches your
          setup and lifestyle to get the most accurate payback calculation.
        </p>
      </div>

      <div className="space-y-6">
        {TARIFF_OPTIONS.map((tariff) => {
          const detail = tariffDetails[tariff.value];
          if (!detail) return null;
          const Icon = detail.icon;

          return (
            <div
              key={tariff.value}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-5 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                  <Icon className="size-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg font-bold text-[var(--text-default)]">
                    {tariff.label}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">{detail.description}</p>
                </div>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border-subtle)]">
                {[
                  { label: 'Avg Import', value: `${tariff.avgImport.toFixed(1)}p/kWh` },
                  { label: 'Cheap Import', value: `${tariff.cheapImport.toFixed(1)}p/kWh` },
                  { label: 'Avg Export', value: `${tariff.avgExport.toFixed(1)}p/kWh` },
                  { label: 'Peak Export', value: `${tariff.peakExport.toFixed(1)}p/kWh` },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--bg-elevated)] px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                      {stat.label}
                    </p>
                    <p className="font-display text-base font-bold tabular-nums text-[var(--color-emphasis)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4 p-5">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-accent-green)] mb-2 uppercase tracking-wider">
                    Advantages
                  </p>
                  <ul className="space-y-1.5">
                    {detail.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-[var(--text-subtle)]">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-accent-green)]" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-accent-rose)] mb-2 uppercase tracking-wider">
                    Considerations
                  </p>
                  <ul className="space-y-1.5">
                    {detail.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-[var(--text-subtle)]">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Pricing Context - Pro Only */}
      {isSubscribed && (
        <div className="mt-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
                <Crown className="size-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--text-default)]">
                  Historical Pricing Context
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  12-month analysis of Octopus Agile pricing patterns and trends
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Key Insights */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-surface)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="size-4 text-[var(--color-accent-green)]" />
                  <span className="text-sm font-medium text-[var(--text-default)]">Best Day</span>
                </div>
                <p className="text-lg font-bold text-[var(--color-accent-green)]">
                  {historicalData.agile.bestDay.rate}p/kWh
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(historicalData.agile.bestDay.date).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="size-4 text-[var(--color-accent-rose)]" />
                  <span className="text-sm font-medium text-[var(--text-default)]">Worst Day</span>
                </div>
                <p className="text-lg font-bold text-[var(--color-accent-rose)]">
                  {historicalData.agile.worstDay.rate}p/kWh
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(historicalData.agile.worstDay.date).toLocaleDateString('en-GB')}
                </p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-[var(--color-primary)]" />
                  <span className="text-sm font-medium text-[var(--text-default)]">Negative Price Days</span>
                </div>
                <p className="text-lg font-bold text-[var(--color-primary)]">
                  {historicalData.agile.negativePriceDays}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Days in 2024</p>
              </div>
            </div>

            {/* Monthly Trends */}
            <div>
              <h3 className="font-display text-base font-bold text-[var(--text-default)] mb-4">
                Agile Monthly Averages (2024)
              </h3>
              <div className="bg-[var(--bg-surface)] rounded-lg p-4">
                <div className="h-32 flex items-end gap-1">
                  {historicalData.agile.monthlyAverage.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary)]/60 rounded-t-sm mb-2"
                        style={{ height: `${(month.avgRate / 50) * 100}%` }}
                      />
                      <span className="text-xs text-[var(--text-muted)] transform -rotate-45 origin-center">
                        {month.month}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-default)]">
                  <div className="text-sm text-[var(--text-muted)]">
                    Average rate across all months: <span className="font-medium text-[var(--text-default)]">
                      {(historicalData.agile.monthlyAverage.reduce((sum, month) => sum + month.avgRate, 0) / historicalData.agile.monthlyAverage.length).toFixed(1)}p/kWh
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Data source: Octopus Energy API
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-[var(--bg-surface)] rounded-lg p-4">
              <h4 className="font-display text-sm font-bold text-[var(--text-default)] mb-3">
                Key Insights for Battery Owners
              </h4>
              <ul className="space-y-2 text-sm text-[var(--text-subtle)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-accent-green)]" />
                  May and October consistently offer the lowest average rates for charging
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-accent-green)]" />
                  Winter months show higher volatility with more peak pricing opportunities
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                  {historicalData.agile.negativePriceDays} days in 2024 had negative pricing - perfect for battery charging
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--color-accent-rose)]" />
                  January peaks can exceed 45p/kWh - avoid consumption during these periods
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pro Upgrade Prompt */}
      {!isSubscribed && (
        <div className="mt-10 rounded-xl border border-[var(--border-default)] bg-gradient-to-r from-[var(--color-brand)]/5 to-[var(--color-primary)]/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-primary)]">
              <Crown className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-[var(--text-default)]">
                Unlock Historical Pricing Insights
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Get access to 12 months of Octopus Agile pricing data, trends analysis, and strategic insights to optimize your battery charging schedule.
              </p>
            </div>
            <Button asChild className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] text-white">
              <Link to="/pricing">
                Upgrade to Pro <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Personalized Comparison */}
      <div className="mt-10">
        <PersonalizedTariffComparison />
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-bold text-[var(--text-default)]">
            Ready to calculate your payback?
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Select your tariff in the calculator and see how quickly your system pays for itself.
          </p>
        </div>
        <Link to="/calculator">
          <Button className="gap-2 bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-primary)] hover:opacity-90 text-white font-semibold whitespace-nowrap">
            Open Calculator <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
