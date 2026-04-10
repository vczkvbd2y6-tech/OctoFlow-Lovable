import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { PaybackResult } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface PaybackTimelineProps {
  results: PaybackResult[];
  names: string[];
}

const COLORS = ['var(--color-primary)', 'var(--color-accent-green)', 'var(--color-emphasis)'];

export default function PaybackTimeline({ results, names }: PaybackTimelineProps) {
  const chartData = useMemo(() => {
    return Array.from({ length: 16 }, (_, year) => {
      const point: Record<string, number | string> = { year: `Year ${year}` };
      results.forEach((r, i) => {
        point[`savings${i}`] = r.cumulativeSavings[year] ?? 0;
      });
      return point;
    });
  }, [results]);

  const maxSavings = Math.max(...results.flatMap(r => r.cumulativeSavings));
  const maxCost = Math.max(...results.map(r => r.systemCost));

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
      <h3 className="font-display text-base font-semibold text-[var(--text-default)] mb-1">
        Payback Timeline
      </h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Cumulative savings over 15 years vs system cost
      </p>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <defs>
              {results.map((_, i) => (
                <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="year"
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-default)' }}
              interval={2}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              domain={[0, Math.max(maxSavings, maxCost) * 1.1]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-default)',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => {
                const idx = parseInt(name.replace('savings', ''));
                return [formatCurrency(Math.round(value)), names[idx] || `Config ${idx + 1}`];
              }}
            />
            {results.map((r, i) => (
              <ReferenceLine
                key={`cost-${i}`}
                y={r.systemCost}
                stroke={COLORS[i]}
                strokeDasharray="6 3"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            ))}
            {results.map((_, i) => (
              <Area
                key={i}
                type="monotone"
                dataKey={`savings${i}`}
                stroke={COLORS[i]}
                fill={`url(#grad-${i})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: COLORS[i] }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {results.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-[var(--text-subtle)]">{names[i]}</span>
            <span className="text-[var(--text-muted)]">—</span>
            <span className="font-semibold text-[var(--text-default)] tabular-nums">
              {r.paybackYears}y {r.paybackMonths}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
