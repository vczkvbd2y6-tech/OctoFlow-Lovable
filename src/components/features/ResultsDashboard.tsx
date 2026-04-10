import type { PaybackResult } from '@/types';
import { Calendar, PiggyBank, TrendingUp, Sun, Zap, ArrowDownToLine, ArrowUpFromLine, Percent } from 'lucide-react';
import StatCard from './StatCard';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ResultsDashboardProps {
  result: PaybackResult;
  configName: string;
}

export default function ResultsDashboard({ result, configName }: ResultsDashboardProps) {
  const monthlyData = result.monthlyBreakdown.map((m) => ({
    month: m.month,
    solar: m.solarGeneration,
    selfUse: m.selfConsumption,
    export: m.gridExport,
    import: m.gridImport,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold text-[var(--text-default)]">{configName}</h3>
        <p className="text-xs text-[var(--text-muted)]">Estimated annual performance on Octopus Agile</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Payback Period"
          value={`${result.paybackYears}y ${result.paybackMonths}m`}
          subtitle={`${formatCurrency(result.systemCost)} system cost`}
          icon={Calendar}
          color="cyan"
        />
        <StatCard
          label="Annual Savings"
          value={formatCurrencyDecimal(result.annualSavings)}
          subtitle={`${formatCurrencyDecimal(result.annualSavings / 12)}/month avg`}
          icon={PiggyBank}
          color="green"
        />
        <StatCard
          label="10-Year ROI"
          value={`${result.roi10Year > 0 ? '+' : ''}${result.roi10Year}%`}
          subtitle="Return on investment"
          icon={TrendingUp}
          color={result.roi10Year > 0 ? 'amber' : 'rose'}
        />
        <StatCard
          label="Solar Generation"
          value={`${result.solarGenerationKwh.toLocaleString()}`}
          subtitle="kWh/year estimated"
          icon={Sun}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Self-Consumption"
          value={`${result.selfConsumptionPct}%`}
          icon={Percent}
          color="green"
        />
        <StatCard
          label="Grid Export"
          value={`${result.gridExportKwh.toLocaleString()}`}
          subtitle="kWh/year"
          icon={ArrowUpFromLine}
          color="cyan"
        />
        <StatCard
          label="Grid Import"
          value={`${result.gridImportKwh.toLocaleString()}`}
          subtitle="kWh/year"
          icon={ArrowDownToLine}
          color="rose"
        />
        <StatCard
          label="Avg Import Rate"
          value={`${result.avgImportRate}p`}
          subtitle="p/kWh on Agile"
          icon={Zap}
          color="amber"
        />
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5">
        <h4 className="font-display text-sm font-semibold text-[var(--text-default)] mb-4">Monthly Energy Flow</h4>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-default)' }}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                unit=" kWh"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '8px',
                  color: 'var(--text-default)',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value.toFixed(1)} kWh`]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: 'var(--text-subtle)' }}
              />
              <Bar dataKey="solar" name="Solar Gen" fill="var(--color-emphasis)" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Bar dataKey="selfUse" name="Self Use" fill="var(--color-accent-green)" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Bar dataKey="export" name="Export" fill="var(--color-primary)" opacity={0.7} radius={[3, 3, 0, 0]} />
              <Bar dataKey="import" name="Import" fill="var(--color-accent-rose)" opacity={0.6} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-default)]">
          <h4 className="font-display text-sm font-semibold text-[var(--text-default)]">Monthly Savings Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
                <th className="px-4 py-2.5 text-left font-medium text-[var(--text-muted)]">Month</th>
                <th className="px-4 py-2.5 text-right font-medium text-[var(--text-muted)]">Solar</th>
                <th className="px-4 py-2.5 text-right font-medium text-[var(--text-muted)]">Import Cost</th>
                <th className="px-4 py-2.5 text-right font-medium text-[var(--text-muted)]">Export £</th>
                <th className="px-4 py-2.5 text-right font-medium text-[var(--text-muted)]">Savings</th>
                <th className="px-4 py-2.5 text-right font-medium text-[var(--text-muted)]">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {result.monthlyBreakdown.map((m) => (
                <tr key={m.month} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/50">
                  <td className="px-4 py-2.5 font-medium text-[var(--text-default)]">{m.month}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-emphasis)]">{m.solarGeneration} kWh</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent-rose)]">£{m.importCost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-accent-green)]">£{m.exportEarnings.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[var(--color-primary)]">£{m.savings.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-subtle)]">£{m.cumulativeSavings.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
