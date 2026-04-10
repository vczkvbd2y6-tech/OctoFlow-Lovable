import { useCalculatorStore } from '@/stores/calculatorStore';
import { Battery, Sun, Zap, PoundSterling, Gauge } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SystemSummaryProps {
  configIndex: number;
}

export default function SystemSummary({ configIndex }: SystemSummaryProps) {
  const { configurations } = useCalculatorStore();
  const config = configurations[configIndex];

  if (!config) return null;

  const getTotalWattage = () => {
    let total = 0;
    if (!config.useCustomSolar && config.solarPanels.length > 0) {
      for (const panel of config.solarPanels) {
        const qty = config.panelQuantities[panel.id] ?? 1;
        const perPanelW = (panel.panelWattage ?? 0) *
          (panel.id.includes('rigid') && panel.specs?.Quantity?.includes('2') ? 2 : 1);
        total += perPanelW * qty;
      }
    } else if (config.useCustomSolar && config.customSolar) {
      total = config.customSolar.sizeValue;
    }
    return total;
  };

  const getTotalCapacity = () => {
    if (config.useCustomBattery && config.customBattery) {
      return config.customBattery.sizeValue;
    }
    return config.totalCapacityWh;
  };

  const totalWattage = getTotalWattage();
  const totalCapacity = getTotalCapacity();
  const totalCapacityKwh = totalCapacity / 1000;
  const totalWattageKw = totalWattage / 1000;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-default)]">{config.name}</h3>
        
        {/* Hardware Summary - 3 columns */}
        <div className="grid grid-cols-3 gap-4">
          {/* Battery/Power Station */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Battery className="size-4 text-[var(--color-primary)]" />
              <p className="text-xs font-semibold text-[var(--text-subtle)]">Battery/Power Station</p>
            </div>
            {config.useCustomBattery && config.customBattery ? (
              <div className="text-sm">
                <p className="text-[var(--text-default)] font-semibold truncate">{config.customBattery.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {totalCapacityKwh.toFixed(1)} kWh
                </p>
              </div>
            ) : config.batteries.length > 0 ? (
              <div className="space-y-1">
                {config.batteries.map((bat) => (
                  <div key={bat.id} className="text-[10px]">
                    <p className="text-[var(--text-default)] font-medium">{bat.name}</p>
                    <p className="text-[var(--text-muted)]">{(bat.capacityWh || 0) / 1000}kWh • £{bat.priceGBP.toLocaleString()}</p>
                  </div>
                ))}
                <p className="text-xs font-semibold text-[var(--color-primary)] pt-1">Total: {totalCapacityKwh.toFixed(1)} kWh</p>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--text-muted)]">Not selected</p>
            )}
          </div>

          {/* Solar Panels */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-[var(--color-emphasis)]" />
              <p className="text-xs font-semibold text-[var(--text-subtle)]">Solar Panels</p>
            </div>
            {config.useCustomSolar && config.customSolar ? (
              <div className="text-sm">
                <p className="text-[var(--text-default)] font-semibold truncate">{config.customSolar.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {totalWattageKw.toFixed(2)} kW
                </p>
              </div>
            ) : config.solarPanels.length > 0 ? (
              <div className="space-y-1">
                {config.solarPanels.map((panel) => {
                  const qty = config.panelQuantities[panel.id] ?? 1;
                  return (
                    <div key={panel.id} className="text-[10px]">
                      <p className="text-[var(--text-default)] font-medium">
                        {panel.name} {qty > 1 ? `× ${qty}` : ''}
                      </p>
                      <p className="text-[var(--text-muted)]">
                        {(panel.panelWattage || 0) * qty}W • £{(panel.priceGBP * qty).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
                <p className="text-xs font-semibold text-[var(--color-emphasis)] pt-1">Total: {totalWattageKw.toFixed(2)} kW</p>
              </div>
            ) : (
              <p className="text-[10px] text-[var(--text-muted)]">Not selected</p>
            )}
          </div>

          {/* Inverter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-[var(--color-accent-green)]" />
              <p className="text-xs font-semibold text-[var(--text-subtle)]">Inverter</p>
            </div>
            {config.useCustomInverter && config.customInverter ? (
              <div className="text-sm">
                <p className="text-[var(--text-default)] font-semibold truncate">{config.customInverter.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{config.customInverter.sizeValue}W</p>
              </div>
            ) : config.inverters.length > 0 ? (
              <div className="space-y-1">
                {config.inverters.map((inv) => (
                  <div key={inv.id} className="text-[10px]">
                    <p className="text-[var(--text-default)] font-medium">{inv.name}</p>
                    <p className="text-[var(--text-muted)]">{inv.outputW}W • £{inv.priceGBP.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[var(--text-muted)]">Not selected</p>
            )}
          </div>
        </div>

        {/* Cost Summary - Full width across bottom */}
        <div className="rounded-lg bg-[var(--bg-surface)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Equipment:</span>
            <span className="text-sm font-semibold text-[var(--text-default)]">
              £{config.totalCost.toLocaleString()}
            </span>
          </div>
          {config.installationCost > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Installation:</span>
              <span className="text-sm font-semibold text-[var(--text-default)]">
                £{config.installationCost.toLocaleString()}
              </span>
            </div>
          )}
          <Separator className="bg-[var(--border-subtle)]" />
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-[var(--text-default)]">Total Cost:</span>
            <span className="text-lg font-bold text-[var(--color-primary)]">
              £{(config.totalCost + config.installationCost).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
