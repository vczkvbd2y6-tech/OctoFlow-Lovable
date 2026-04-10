import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'amber' | 'green' | 'rose';
}

const colorMap = {
  cyan: {
    bg: 'bg-[var(--color-primary)]/10',
    text: 'text-[var(--color-primary)]',
    border: 'border-[var(--color-primary)]/20',
  },
  amber: {
    bg: 'bg-[var(--color-emphasis)]/10',
    text: 'text-[var(--color-emphasis)]',
    border: 'border-[var(--color-emphasis)]/20',
  },
  green: {
    bg: 'bg-[var(--color-accent-green)]/10',
    text: 'text-[var(--color-accent-green)]',
    border: 'border-[var(--color-accent-green)]/20',
  },
  rose: {
    bg: 'bg-[var(--color-accent-rose)]/10',
    text: 'text-[var(--color-accent-rose)]',
    border: 'border-[var(--color-accent-rose)]/20',
  },
};

export default function StatCard({ label, value, subtitle, icon: Icon, color = 'cyan' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} bg-[var(--bg-elevated)] p-5 transition-all hover:shadow-glow`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase text-[var(--text-muted)] mb-1.5">{label}</p>
          <p className={`font-display text-2xl font-bold tabular-nums ${c.text}`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-[var(--text-subtle)]">{subtitle}</p>
          )}
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
          <Icon className={`size-5 ${c.text}`} />
        </div>
      </div>
    </div>
  );
}
