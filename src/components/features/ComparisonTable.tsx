import type { SystemConfiguration, PaybackResult } from '@/types';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/calculations';
import { Trophy } from 'lucide-react';

interface ComparisonTableProps {
  configs: SystemConfiguration[];
  results: (PaybackResult | null)[];
}

export default function ComparisonTable({ configs, results }: ComparisonTableProps) {
  const validResults = results.filter((r): r is PaybackResult => r !== null);
  if (validResults.length < 2) return null;

  const bestPaybackIdx = validResults.reduce((best, r, i) =>
    (r.paybackYears * 12 + r.paybackMonths) < (validResults[best].paybackYears * 12 + validResults[best].paybackMonths) ? i : best
  , 0);

  const rows = [
    { label: 'System Cost', key: 'systemCost', format: (r: PaybackResult) => formatCurrency(r.systemCost) },
    { label: 'Payback Period', key: 'payback', format: (r: PaybackResult) => `${r.paybackYears}y ${r.paybackMonths}m` },
    { label: 'Annual Savings', key: 'annualSavings', format: (r: PaybackResult) => formatCurrencyDecimal(r.annualSavings) },
    { label: '10-Year ROI', key: 'roi', format: (r: PaybackResult) => `${r.roi10Year > 0 ? '+' : ''}${r.roi10Year}%` },
    { label: 'Solar Gen.', key: 'solar', format: (r: PaybackResult) => `${r.solarGenerationKwh.toLocaleString()} kWh` },
    { label: 'Self-Consumption', key: 'self', format: (r: PaybackResult) => `${r.selfConsumptionPct}%` },
    { label: 'Grid Export', key: 'export', format: (r: PaybackResult) => `${r.gridExportKwh.toLocaleString()} kWh` },
  ];

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border-default)]">
        <h3 className="font-display text-base font-semibold text-[var(--text-default)]">Side-by-Side Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)]">Metric</th>
              {configs.map((c, i) => (
                <th key={c.id} className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)]">
                  <div className="flex items-center justify-end gap-1.5">
                    {i === bestPaybackIdx && <Trophy className="size-3.5 text-[var(--color-emphasis)]" />}
                    {c.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/50">
                <td className="px-4 py-3 font-medium text-[var(--text-subtle)]">{row.label}</td>
                {results.map((r, i) => (
                  <td key={i} className={`px-4 py-3 text-right tabular-nums ${
                    i === bestPaybackIdx ? 'text-[var(--color-primary)] font-semibold' : 'text-[var(--text-default)]'
                  }`}>
                    {r ? row.format(r) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
