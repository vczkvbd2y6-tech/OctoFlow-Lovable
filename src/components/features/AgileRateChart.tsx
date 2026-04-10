import { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useAgileRates, type LiveAgileRate } from '@/hooks/useAgileRates';
import { RefreshCw, Wifi, WifiOff, ChevronDown, Clock } from 'lucide-react';

interface AgileRateChartProps {
  region?: string;
  onRegionChange?: (region: string) => void;
  ratesData?: ReturnType<typeof useAgileRates>;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      const now = new Date();
      const ukHour = parseInt(now.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false }));
      const ukMinute = parseInt(now.toLocaleString('en-GB', { timeZone: 'Europe/London', minute: '2-digit' }));
      const ukNowMinutes = ukHour * 60 + ukMinute;
      const targetMinutes = 16 * 60; // 4pm UK time

      if (ukNowMinutes >= targetMinutes) {
        setTimeLeft('');
        return;
      }

      const diffMin = targetMinutes - ukNowMinutes;
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      const secs = 60 - now.getSeconds();

      setTimeLeft(
        `${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs < 60 ? `${secs}s` : ''}`
      );
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export default function AgileRateChart({ region: externalRegion, onRegionChange, ratesData: externalRatesData }: AgileRateChartProps = {}) {
  const [showExport, setShowExport] = useState(false);
  const [dayView, setDayView] = useState<'today' | 'tomorrow'>('today');
  const [internalRegion, setInternalRegion] = useState('South England');
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000); // update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const region = externalRegion ?? internalRegion;
  const setRegion = (r: string) => {
    if (onRegionChange) onRegionChange(r);
    else setInternalRegion(r);
  };

  const internalRatesData = useAgileRates(externalRatesData ? undefined : region);
  const {
    importRates, exportRates,
    tomorrowImportRates, tomorrowExportRates,
    hasTomorrowRates,
    loading, error, lastUpdated, refetch, regions,
  } = externalRatesData ?? internalRatesData;

  const countdown = useCountdown();

  const rates = dayView === 'tomorrow'
    ? (showExport ? tomorrowExportRates : tomorrowImportRates)
    : (showExport ? exportRates : importRates);

  const chartData = useMemo(() => {
    return rates.map((r: LiveAgileRate) => ({
      time: r.time,
      rate: Math.round(r.rate * 100) / 100,
      isNegative: r.rate < 0,
    }));
  }, [rates]);

  const hasNegative = useMemo(() => {
    return chartData.some(d => d.isNegative);
  }, [chartData]);

  const currentRateIndex = useMemo(() => {
    if (chartData.length === 0) return -1;
    const now = new Date();
    const ukHour = parseInt(now.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false }));
    const ukMinute = parseInt(now.toLocaleString('en-GB', { timeZone: 'Europe/London', minute: '2-digit' }));
    const slotMinute = ukMinute < 30 ? 0 : 30;
    const currentSlot = `${String(ukHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;
    return chartData.findIndex(d => d.time === currentSlot);
  }, [chartData, currentTime]);

  const currentRate = currentRateIndex >= 0 ? chartData[currentRateIndex] : chartData[0];

  const avg = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((a, b) => a + b.rate, 0);
    return sum / chartData.length;
  }, [chartData]);

  const minRate = useMemo(() => Math.min(...chartData.map((d) => d.rate), 0), [chartData]);
  const maxRate = useMemo(() => Math.max(...chartData.map((d) => d.rate), 0), [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const color = getBarColor(value, showExport, avg);
      return (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            color: 'var(--text-default)',
            fontSize: '12px',
            padding: '8px',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{`Time: ${label}`}</p>
          <p style={{ margin: 0, color }}>
            {`${value.toFixed(2)}p/kWh`}
          </p>
          <p style={{ margin: 0, color }}>
            {showExport ? 'Export Rate' : 'Import Rate'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarOpacity = (rate: number, isExport: boolean, avg: number) => {
    if (isExport) return 0.85;
    if (rate < 0) return 1;
    if (rate < 8) return 0.95;
    if (rate > 30) return 1;
    if (rate > avg) return 0.9;
    return 0.8;
  };

  const getBarColor = (rate: number, isExport: boolean, avg: number) => {
    if (isExport) {
      return rate < 8 ? 'var(--color-accent-green)' : 'var(--color-accent-green)';
    } else {
      if (rate < 8) {
        return 'var(--color-accent-green)';
      } else if (rate < 0) {
        return 'var(--color-accent-green)';
      } else if (rate > 30) {
        return 'var(--color-accent-rose)';
      } else if (rate > avg) {
        return 'var(--color-emphasis)';
      } else {
        return 'var(--color-primary)';
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-[min(100%,520px)] sm:max-w-[min(100%,580px)] rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 min-w-0">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-base font-semibold text-[var(--text-default)]">
              Octopus Agile — {dayView === 'tomorrow' ? "Tomorrow's" : 'Live'} Rates
            </h3>
            {loading ? (
              <RefreshCw className="size-3.5 text-[var(--text-muted)] animate-spin" />
            ) : error ? (
              <WifiOff className="size-3.5 text-[var(--color-accent-rose)]" />
            ) : (
              <Wifi className="size-3.5 text-[var(--color-accent-green)]" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-[var(--text-muted)]">
              {error
                ? 'Using cached data — API temporarily unavailable'
                : `${dayView === 'tomorrow' ? "Tomorrow's" : "Today's"} half-hourly ${showExport ? 'export' : 'import'} prices (p/kWh inc. VAT)`}
            </p>
            {lastUpdated && !error && (
              <span className="text-[10px] text-[var(--text-muted)] opacity-70">
                Updated {formatTime(lastUpdated.toISOString())}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border-default)] overflow-hidden">
            <button
              onClick={() => setDayView('today')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dayView === 'today'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDayView('tomorrow')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                dayView === 'tomorrow'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              Tomorrow
              {hasTomorrowRates && (
                <span className="size-1.5 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowRegionPicker(!showRegionPicker)}
              className="flex items-center gap-1 rounded-lg border border-[var(--border-default)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-subtle)] transition-colors"
            >
              {region} <ChevronDown className="size-3" />
            </button>
            {showRegionPicker && (
              <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg py-1 max-h-56 overflow-y-auto">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRegion(r); setShowRegionPicker(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      r === region
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5 font-medium'
                        : 'text-[var(--text-subtle)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex rounded-lg border border-[var(--border-default)] overflow-hidden">
            <button
              onClick={() => setShowExport(false)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                !showExport
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setShowExport(true)}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                showExport
                  ? 'bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              Export
            </button>
          </div>

          <button
            onClick={refetch}
            disabled={loading}
            className="rounded-lg border border-[var(--border-default)] p-1.5 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
            title="Refresh rates"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {dayView === 'tomorrow' && !hasTomorrowRates && (
        <div className="mb-3 rounded-lg border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-[var(--color-emphasis)] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--color-emphasis)]">
                Tomorrow's rates not yet published
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Octopus publishes next-day prices at 4pm UK time.
                {countdown && (
                  <span className="ml-1 font-mono font-semibold text-[var(--color-emphasis)]">
                    {countdown} remaining
                  </span>
                )}
                {!countdown && ' Check back after 4pm.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {hasNegative && !showExport && dayView === 'today' && (
        <div className="mb-3 rounded-lg border border-[var(--color-accent-green)]/20 bg-[var(--color-accent-green)]/5 px-3 py-2">
          <p className="text-xs font-medium text-[var(--color-accent-green)]">
            Negative prices today — Octopus pays you to use electricity during those slots!
          </p>
        </div>
      )}

      {hasNegative && !showExport && dayView === 'tomorrow' && hasTomorrowRates && (
        <div className="mb-3 rounded-lg border border-[var(--color-accent-green)]/20 bg-[var(--color-accent-green)]/5 px-3 py-2">
          <p className="text-xs font-medium text-[var(--color-accent-green)]">
            Negative prices tomorrow — Octopus will pay you to use electricity during those slots!
          </p>
        </div>
      )}

      {!showExport && dayView === 'today' && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Current Price</p>
            <p className={`font-display text-lg font-bold tabular-nums mb-1 ${
              currentRate && currentRate.rate < 0
                ? 'text-[var(--color-accent-green)]'
                : currentRate && currentRate.rate > 30
                ? 'text-[var(--color-accent-rose)]'
                : currentRate && currentRate.rate > avg
                ? 'text-[var(--color-emphasis)]'
                : 'text-[var(--color-primary)]'
            }`}>
              {currentRate ? `${currentRate.rate.toFixed(2)}p` : '—'}
            </p>
            <p className="text-[9px] text-[var(--text-muted)]">Confirmed by Octopus</p>
          </div>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-3">
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Next 24hr Avg</p>
            <p className="font-display text-lg font-bold tabular-nums text-white">
              {avg.toFixed(2)}p
            </p>
            <p className="text-[9px] text-[var(--text-muted)]">Predicted</p>
          </div>
        </div>
      )}

      <div className="h-56 sm:h-64 overflow-x-auto">
        <div className="min-w-[420px] sm:min-w-full h-full">
          {loading && chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="size-6 text-[var(--color-primary)] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[var(--text-muted)]">Fetching live rates from Octopus Energy...</p>
            </div>
          </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-[var(--text-muted)]">No rate data available for this region</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <XAxis
                dataKey="time"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-default)' }}
                interval={5}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                unit="p"
                domain={[Math.min(minRate - 1, 0), maxRate + 2]}
              />
              <Tooltip content={<CustomTooltip />} />
              {!showExport && <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={0.5} />}
              <ReferenceLine
                y={avg}
                stroke="var(--color-emphasis)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Bar dataKey="rate" radius={[2, 2, 0, 0]} maxBarSize={10}>
                {chartData.map((entry, index) => {
                  const color = getBarColor(entry.rate, showExport, avg);
                  const opacity = getBarOpacity(entry.rate, showExport, avg);

                  return <Cell key={index} fill={color} opacity={opacity} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        {!showExport && hasNegative && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[var(--color-accent-green)]" />
            Negative (you get paid)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[var(--color-primary)]" />
          Below avg
        </span>
        {!showExport && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--color-emphasis)]" />
              Above avg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[var(--color-accent-rose)]" />
              Peak (&gt;30p)
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t-2 border-dashed border-[var(--color-emphasis)]" />
          Average: {avg.toFixed(1)}p
        </span>
        <span className="ml-auto text-[10px] opacity-60">
          Source: api.octopus.energy
        </span>
      </div>
    </div>
  );
}
