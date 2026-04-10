import { useCalculatorStore } from '@/stores/calculatorStore';
import { formatCurrency, formatCurrencyDecimal } from '@/lib/calculations';
import { Trash2, Calendar, TrendingUp, Battery, Sun, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import emptyImg from '@/assets/empty-config.jpg';
import ProGate from '@/components/features/ProGate';

export default function SavedCalculations() {
  return (
    <ProGate feature="Saved Calculations">
      <SavedCalculationsContent />
    </ProGate>
  );
}

function SavedCalculationsContent() {
  const { savedCalculations, deleteSavedCalculation } = useCalculatorStore();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteSavedCalculation(id);
    toast({ title: 'Deleted', description: 'Calculation removed from saved list.' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[var(--text-default)]">Saved Calculations</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Your previously calculated payback estimates
        </p>
      </div>

      {savedCalculations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-16 text-center">
          <img src={emptyImg} alt="No saved calculations" className="w-32 h-24 object-cover rounded-lg opacity-60 mb-5" />
          <BookmarkX className="size-10 text-[var(--text-muted)] mb-3 opacity-40" />
          <h3 className="font-display text-lg font-bold text-[var(--text-default)] mb-2">No saved calculations</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Run a calculation in the Calculator, then hit "Save" to store it here for future reference.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedCalculations.map((calc) => (
            <div
              key={calc.id}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-5 hover:shadow-glow transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-sm font-bold text-[var(--text-default)] truncate">{calc.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1">
                    <Calendar className="size-3" />
                    {new Date(calc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[var(--text-muted)] hover:text-[var(--color-accent-rose)]"
                  onClick={() => handleDelete(calc.id)}
                  aria-label="Delete calculation"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg bg-[var(--bg-surface)] p-3">
                  <p className="text-[10px] uppercase text-[var(--text-muted)] mb-0.5">Payback</p>
                  <p className="font-display text-lg font-bold tabular-nums text-[var(--color-primary)]">
                    {calc.result.paybackYears}y {calc.result.paybackMonths}m
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--bg-surface)] p-3">
                  <p className="text-[10px] uppercase text-[var(--text-muted)] mb-0.5">Annual Savings</p>
                  <p className="font-display text-lg font-bold tabular-nums text-[var(--color-accent-green)]">
                    {formatCurrencyDecimal(calc.result.annualSavings)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[var(--text-subtle)]">
                  <span className="flex items-center gap-1.5">
                    <Battery className="size-3" /> Battery
                  </span>
                  <span className="font-medium text-[var(--text-default)]">{(calc.configuration.batteries?.length ? calc.configuration.batteries.map(b => b.name).join(', ') : calc.configuration.battery?.name) ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-subtle)]">
                  <span className="flex items-center gap-1.5">
                    <Sun className="size-3" /> Solar
                  </span>
                  <span className="font-medium text-[var(--text-default)]">{(calc.configuration.solarPanels?.length ? (calc.configuration.solarPanels as any[]).map((p: any) => p.name).join(', ') : '—')}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-subtle)]">
                  <span>System Cost</span>
                  <span className="font-semibold text-[var(--color-emphasis)] tabular-nums">
                    {formatCurrency(calc.result.systemCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-subtle)]">
                  <span className="flex items-center gap-1.5"><TrendingUp className="size-3" /> 10yr ROI</span>
                  <span className={`font-semibold tabular-nums ${calc.result.roi10Year > 0 ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-rose)]'}`}>
                    {calc.result.roi10Year > 0 ? '+' : ''}{calc.result.roi10Year}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
