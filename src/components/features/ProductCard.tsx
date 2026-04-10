import type { EcoFlowProduct } from '@/types';
import { Battery, Sun, Zap, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface ProductCardProps {
  product: EcoFlowProduct;
  selected?: boolean;
  onSelect?: (product: EcoFlowProduct) => void;
  compact?: boolean;
}

const categoryIcons = {
  battery: Battery,
  'solar-panel': Sun,
  inverter: Zap,
  bundle: Package,
};

const categoryLabels = {
  battery: 'Battery',
  'solar-panel': 'Solar Panel',
  inverter: 'Inverter',
  bundle: 'Bundle',
};

export default function ProductCard({ product, selected, onSelect, compact }: ProductCardProps) {
  const Icon = categoryIcons[product.category];

  if (compact) {
    return (
      <button
        onClick={() => onSelect?.(product)}
        className={`w-full text-left rounded-lg border p-3 transition-all ${
          selected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-glow'
            : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-glow)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            selected ? 'bg-[var(--color-primary)]/15' : 'bg-[var(--bg-elevated)]'
          }`}>
            <Icon className={`size-4 ${selected ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text-default)] truncate">{product.name}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {product.capacityWh ? `${(product.capacityWh / 1000).toFixed(1)} kWh` : ''}
              {product.panelWattage ? `${product.panelWattage}W` : ''}
              {product.outputW && !product.capacityWh ? `${product.outputW}W` : ''}
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums text-[var(--color-emphasis)]">
            {formatCurrency(product.priceGBP)}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`group rounded-xl border overflow-hidden transition-all ${
        selected
          ? 'border-[var(--color-primary)] shadow-glow-md'
          : 'border-[var(--border-default)] hover:border-[var(--border-glow)] hover:shadow-glow'
      } bg-[var(--bg-elevated)]`}
    >
      <div className="relative h-40 overflow-hidden bg-[var(--bg-surface)]">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-md bg-[var(--bg-overlay)] backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--text-subtle)]">
          {categoryLabels[product.category]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-bold text-[var(--text-default)] mb-1">{product.name}</h3>
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

        {product.affiliateLink && (
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mb-3"
          >
            <Package className="size-3" />
            Buy now
          </a>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {product.capacityWh && (
            <span className="rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
              {(product.capacityWh / 1000).toFixed(1)} kWh
            </span>
          )}
          {product.outputW && product.outputW > 0 && (
            <span className="rounded-md bg-[var(--color-emphasis)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-emphasis)]">
              {product.outputW}W output
            </span>
          )}
          {product.panelWattage && (
            <span className="rounded-md bg-[var(--color-accent-green)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent-green)]">
              {product.panelWattage}W panel
            </span>
          )}
          {product.cycleLife && (
            <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-subtle)]">
              {product.cycleLife.toLocaleString()} cycles
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-display text-xl font-bold tabular-nums text-[var(--color-emphasis)]">
            {formatCurrency(product.priceGBP)}
          </p>
          {onSelect && (
            <button
              onClick={() => onSelect(product)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                selected
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-subtle)] hover:bg-[var(--color-primary)]/15 hover:text-[var(--color-primary)]'
              }`}
            >
              {selected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
