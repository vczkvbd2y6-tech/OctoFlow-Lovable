import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RefreshCw, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useAgileForecast } from '@/hooks/useAgileForecast';

interface AgileForecastChartProps {
  region: string;
}

function formatTick(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Europe/London',
  });
}

function formatTooltipLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  });
}

export default function AgileForecastChart({ region }: AgileForecastChartProps) {
  const [timeRange, setTimeRange] = useState<'1day' | '3day' | '7day' | '21day'>('21day');
  const { data, loading, error, summary, lastUpdated, refetch } = useAgileForecast(region);

  const filteredData = useMemo(() => {
    if (timeRange === '21day') return data;
    
    const slotsPerDay = 48; // 24 hours * 2 half-hour slots
    const daysToShow = timeRange === '1day' ? 1 : timeRange === '3day' ? 3 : 7;
    const slotsToShow = daysToShow * slotsPerDay;
    
    return data.slice(0, slotsToShow);
  }, [data, timeRange]);

  const chartData = useMemo(
    () =>
      filteredData.map((d) => ({
        ...d,
        rangeMid: (d.low + d.high) / 2,
      })),
    [filteredData],
  );

  const displaySummary = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0 };
    const prices = chartData.map(d => d.rangeMid);
    return {
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [chartData]);

  return (
    <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--bg-elevated)] p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-[var(--text-default)]">
              Agile Price Forecast
              {timeRange === '1day' && ' — 1 Day'}
              {timeRange === '3day' && ' — 3 Days'}
              {timeRange === '7day' && ' — 7 Days'}
              {timeRange === '21day' && ' — 21 Days'}
            </h3>
            {loading ? (
              <RefreshCw className="size-3.5 animate-spin text-[var(--text-muted)]" />
            ) : error ? (
              <WifiOff className="size-3.5 text-[var(--color-accent-rose)]" />
            ) : (
              <Wifi className="size-3.5 text-[var(--color-accent-green)]" />
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Half-hourly predicted import rates from agileforecast.co.uk for {region}
          </p>
          {lastUpdated && !error && (
            <p className="mt-1 text-[10px] text-[var(--text-muted)] opacity-80">
              Forecast run: {lastUpdated.toLocaleString('en-GB', { timeZone: 'Europe/London' })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border-default)] overflow-hidden">
            <button
              onClick={() => setTimeRange('1day')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                timeRange === '1day'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              1 day
            </button>
            <button
              onClick={() => setTimeRange('3day')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                timeRange === '3day'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              3 days
            </button>
            <button
              onClick={() => setTimeRange('7day')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                timeRange === '7day'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setTimeRange('21day')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                timeRange === '21day'
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-subtle)]'
              }`}
            >
              21 days
            </button>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="rounded-lg border border-[var(--border-default)] p-1.5 text-[var(--text-muted)] transition-colors hover:text-[var(--color-primary)] disabled:opacity-50"
            title="Refresh forecast"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Average</p>
          <p className="font-display text-sm font-bold text-[var(--color-primary)] tabular-nums">
            {displaySummary.avg.toFixed(1)}p
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Lowest</p>
          <p className="font-display text-sm font-bold text-[var(--color-accent-green)] tabular-nums">
            {displaySummary.min.toFixed(1)}p
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Highest</p>
          <p className="font-display text-sm font-bold text-[var(--color-accent-rose)] tabular-nums">
            {displaySummary.max.toFixed(1)}p
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-[var(--color-accent-rose)]/25 bg-[var(--color-accent-rose)]/10 px-3 py-2">
          <p className="text-xs text-[var(--color-accent-rose)]">Unable to load forecast: {error}</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72">
          {loading && chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <RefreshCw className="mx-auto mb-2 size-6 animate-spin text-[var(--color-primary)]" />
                <p className="text-xs text-[var(--text-muted)]">Loading 21-day half-hourly forecast...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-[var(--text-muted)]">No forecast data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickCount={8}
                  tickFormatter={formatTick}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border-default)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  unit="p"
                  domain={[
                    (min: number) => Math.floor(Math.min(min, 0) - 2),
                    (max: number) => Math.ceil(max + 2),
                  ]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '8px',
                    color: 'var(--text-default)',
                    fontSize: '12px',
                  }}
                  labelFormatter={(value: number) => formatTooltipLabel(value)}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      pred: 'Predicted',
                      low: 'Low bound',
                      high: 'High bound',
                    };
                    return [`${value.toFixed(2)}p/kWh`, labels[name] ?? name];
                  }}
                />
                <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={0.6} />
                <ReferenceLine
                  y={summary.avg}
                  stroke="var(--color-emphasis)"
                  strokeDasharray="4 4"
                  strokeWidth={1.1}
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="var(--color-accent-green)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="var(--color-accent-rose)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="pred"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <TrendingUp className="size-3.5 text-[var(--color-emphasis)]" />
        Purple = predicted, green = lower bound, rose = upper bound
      </div>
    </div>
  );
}
