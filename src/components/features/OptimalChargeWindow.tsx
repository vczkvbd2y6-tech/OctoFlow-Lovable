import { useMemo } from 'react';
import { Battery, Car, Zap, Clock, TrendingDown, ArrowRight } from 'lucide-react';
import type { LiveAgileRate } from '@/hooks/useAgileRates';

interface OptimalChargeWindowProps {
  importRates: LiveAgileRate[];
  tomorrowImportRates: LiveAgileRate[];
  hasTomorrowRates: boolean;
  loading: boolean;
}

interface ChargeWindow {
  startTime: string;
  endTime: string;
  avgRate: number;
  slots: number;
  cheapestRate: number;
  label: string;
}

function findCheapestWindow(rates: LiveAgileRate[], windowSlots: number): ChargeWindow | null {
  if (rates.length < windowSlots) return null;

  let bestStart = 0;
  let bestAvg = Infinity;

  for (let i = 0; i <= rates.length - windowSlots; i++) {
    const slice = rates.slice(i, i + windowSlots);
    const avg = slice.reduce((sum, r) => sum + r.rate, 0) / windowSlots;
    if (avg < bestAvg) {
      bestAvg = avg;
      bestStart = i;
    }
  }

  const window = rates.slice(bestStart, bestStart + windowSlots);
  const cheapest = Math.min(...window.map((r) => r.rate));

  return {
    startTime: window[0].time,
    endTime: bestStart + windowSlots < rates.length
      ? rates[bestStart + windowSlots].time
      : '00:00',
    avgRate: Math.round(bestAvg * 10) / 10,
    slots: windowSlots,
    cheapestRate: Math.round(cheapest * 10) / 10,
    label: `${window[0].time} – ${bestStart + windowSlots < rates.length ? rates[bestStart + windowSlots].time : '00:00'}`,
  };
}

function findTopCheapestSlots(rates: LiveAgileRate[], count: number) {
  return [...rates].sort((a, b) => a.rate - b.rate).slice(0, count);
}

export default function OptimalChargeWindow({
  importRates,
  tomorrowImportRates,
  hasTomorrowRates,
  loading,
}: OptimalChargeWindowProps) {
  const ratesToUse = hasTomorrowRates && tomorrowImportRates.length > 0
    ? tomorrowImportRates
    : importRates;

  const dayLabel = hasTomorrowRates && tomorrowImportRates.length > 0 ? 'Tomorrow' : 'Today';

  const analysis = useMemo(() => {
    if (ratesToUse.length === 0) return null;

    // Battery: 2-hour window (4 × 30-min slots)
    const battery2h = findCheapestWindow(ratesToUse, 4);
    // EV: 4-hour window (8 × 30-min slots)
    const ev4h = findCheapestWindow(ratesToUse, 8);
    // Top 6 cheapest individual slots
    const cheapestSlots = findTopCheapestSlots(ratesToUse, 6);
    // Current rate (first future slot or first slot)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSlot = ratesToUse.find(
      (r) => r.hour === currentHour && (currentMinute < 30 ? r.minute === 0 : r.minute === 30)
    ) || ratesToUse[0];

    return { battery2h, ev4h, cheapestSlots, currentSlot };
  }, [ratesToUse]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 animate-pulse">
        <div className="h-5 w-48 bg-[var(--bg-surface)] rounded mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-28 bg-[var(--bg-surface)] rounded-lg" />
          <div className="h-28 bg-[var(--bg-surface)] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const rateColor = (rate: number) => {
    if (rate < 0) return 'text-[var(--color-accent-green)]';
    if (rate < 10) return 'text-[var(--color-accent-green)]';
    if (rate < 20) return 'text-[var(--color-primary)]';
    if (rate < 30) return 'text-[var(--color-emphasis)]';
    return 'text-[var(--color-accent-rose)]';
  };

  return (
    <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--bg-elevated)] overflow-hidden">
      <div className="border-b border-[var(--border-default)] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
            <Zap className="size-4 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-[var(--text-default)]">Optimal Charge Windows</h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Based on {dayLabel.toLowerCase()}&apos;s Agile rates
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
          {dayLabel}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Battery + EV windows */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Battery Window */}
          {analysis.battery2h && (
            <div className="rounded-lg border border-[var(--color-accent-green)]/20 bg-[var(--color-accent-green)]/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Battery className="size-4 text-[var(--color-accent-green)]" />
                <span className="text-xs font-semibold text-[var(--color-accent-green)]">Battery Charge</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <Clock className="size-3 text-[var(--text-muted)]" />
                <span className="font-display text-lg font-bold text-[var(--text-default)]">
                  {analysis.battery2h.startTime}
                </span>
                <ArrowRight className="size-3 text-[var(--text-muted)]" />
                <span className="font-display text-lg font-bold text-[var(--text-default)]">
                  {analysis.battery2h.endTime}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mb-2">2-hour window — {analysis.battery2h.slots} slots</p>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)]">Avg rate</span>
                  <p className={`font-display text-sm font-bold tabular-nums ${rateColor(analysis.battery2h.avgRate)}`}>
                    {analysis.battery2h.avgRate}p
                  </p>
                </div>
                <div className="h-6 w-px bg-[var(--border-default)]" />
                <div>
                  <span className="text-[10px] text-[var(--text-muted)]">Cheapest</span>
                  <p className={`font-display text-sm font-bold tabular-nums ${rateColor(analysis.battery2h.cheapestRate)}`}>
                    {analysis.battery2h.cheapestRate}p
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* EV Window */}
          {analysis.ev4h && (
            <div className="rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Car className="size-4 text-[var(--color-primary)]" />
                <span className="text-xs font-semibold text-[var(--color-primary)]">EV Charge</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <Clock className="size-3 text-[var(--text-muted)]" />
                <span className="font-display text-lg font-bold text-[var(--text-default)]">
                  {analysis.ev4h.startTime}
                </span>
                <ArrowRight className="size-3 text-[var(--text-muted)]" />
                <span className="font-display text-lg font-bold text-[var(--text-default)]">
                  {analysis.ev4h.endTime}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mb-2">4-hour window — {analysis.ev4h.slots} slots</p>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)]">Avg rate</span>
                  <p className={`font-display text-sm font-bold tabular-nums ${rateColor(analysis.ev4h.avgRate)}`}>
                    {analysis.ev4h.avgRate}p
                  </p>
                </div>
                <div className="h-6 w-px bg-[var(--border-default)]" />
                <div>
                  <span className="text-[10px] text-[var(--text-muted)]">Cheapest</span>
                  <p className={`font-display text-sm font-bold tabular-nums ${rateColor(analysis.ev4h.cheapestRate)}`}>
                    {analysis.ev4h.cheapestRate}p
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cheapest individual slots */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingDown className="size-3.5 text-[var(--color-accent-green)]" />
            <span className="text-xs font-semibold text-[var(--text-subtle)]">Cheapest 3-Hour Slots ({dayLabel})</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {analysis.cheapestSlots.map((slot, i) => (
              <div
                key={`${slot.time}-${i}`}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2.5 text-center"
              >
                <p className="font-display text-xs font-bold text-[var(--text-default)] mb-0.5">{slot.time}</p>
                <p className={`font-display text-sm font-bold tabular-nums ${rateColor(slot.rate)}`}>
                  {slot.rate.toFixed(1)}p
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
