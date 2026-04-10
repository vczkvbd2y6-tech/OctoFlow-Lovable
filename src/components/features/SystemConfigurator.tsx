import { useCallback, useEffect, useState } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { useProducts } from '@/hooks/useProducts';
import type { EcoFlowProduct, SystemConfiguration, CustomProduct } from '@/types';
import ProductCard from './ProductCard';
import EnergyProfileForm from './EnergyProfileForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Battery, Sun, Plus, Minus, Trash2, Zap, PenLine, Wrench, Check, Calculator as CalcIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SystemConfiguratorProps {
  configIndex: number;
  onCalculate?: () => void;
}

function CustomProductForm({
  label,
  sizeUnit,
  custom,
  onChange,
}: {
  label: string;
  sizeUnit: string;
  custom: CustomProduct | null;
  onChange: (cp: CustomProduct) => void;
}) {
  const current: CustomProduct = custom ?? { name: '', sizeValue: 0, sizeUnit, cost: 0 };

  return (
    <div className="rounded-lg border border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-3 space-y-3">
      <p className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
        <PenLine className="size-3" /> Custom {label}
      </p>
      <div className="space-y-2">
        <Input
          placeholder="Product Name"
          value={current.name}
          onChange={(e) => onChange({ ...current, name: e.target.value })}
          className="bg-[var(--bg-surface)] border-[var(--border-default)] text-sm h-8"
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Input
              type="number"
              placeholder="Size"
              value={current.sizeValue || ''}
              onChange={(e) => onChange({ ...current, sizeValue: Number(e.target.value) })}
              className="bg-[var(--bg-surface)] border-[var(--border-default)] text-sm h-8 pr-12 tabular-nums"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]">
              {sizeUnit}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="Cost"
              value={current.cost || ''}
              onChange={(e) => onChange({ ...current, cost: Number(e.target.value) })}
              className="bg-[var(--bg-surface)] border-[var(--border-default)] text-sm h-8 pl-6 tabular-nums"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">£</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiProductCard({
  product,
  selected,
  onToggle,
}: {
  product: EcoFlowProduct;
  selected: boolean;
  onToggle: (product: EcoFlowProduct) => void;
}) {
  const categoryIcons = { battery: Battery, 'solar-panel': Sun, inverter: Zap, bundle: Battery };
  const Icon = categoryIcons[product.category] || Battery;

  return (
    <button
      onClick={() => onToggle(product)}
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
          {selected ? (
            <Check className="size-4 text-[var(--color-primary)]" />
          ) : (
            <Icon className="size-4 text-[var(--text-muted)]" />
          )}
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
          £{product.priceGBP.toLocaleString()}
        </p>
      </div>
    </button>
  );
}

export default function SystemConfigurator({ configIndex, onCalculate }: SystemConfiguratorProps) {
  const { configurations, updateConfiguration, removeConfiguration } = useCalculatorStore();
  const config = configurations[configIndex] || configurations[0];

  const { batteries: allBatteries, solarPanels: allPanels, inverters: allInverters } = useProducts();

  if (!config) {
    return (
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center text-[var(--text-subtle)]">
        Loading calculator configuration...
      </div>
    );
  }

  const [localBatteries, setLocalBatteries] = useState<EcoFlowProduct[]>(config.batteries);
  const [localInverters, setLocalInverters] = useState<EcoFlowProduct[]>(config.inverters);
  const [localSolarPanels, setLocalSolarPanels] = useState<EcoFlowProduct[]>(config.solarPanels);
  const [localPanelQuantities, setLocalPanelQuantities] = useState(config.panelQuantities);

  useEffect(() => {
    setLocalBatteries(config.batteries);
    setLocalInverters(config.inverters);
    setLocalSolarPanels(config.solarPanels);
    setLocalPanelQuantities(config.panelQuantities);
  }, [config.batteries, config.inverters, config.solarPanels, config.panelQuantities]);

  const recalcTotals = useCallback((updates: Partial<SystemConfiguration>) => {
    const merged = { ...config, ...updates };
    let batteryPrice = 0;
    let batteryWh = 0;
    let panelW = 0;
    let panelPrice = 0;
    let inverterPrice = 0;

    // Batteries (multi)
    if (!merged.useCustomBattery && merged.batteries.length > 0) {
      for (const bat of merged.batteries) {
        batteryPrice += bat.priceGBP;
        batteryWh += bat.capacityWh ?? 0;
      }
    } else if (merged.useCustomBattery && merged.customBattery) {
      batteryWh = merged.customBattery.sizeValue;
    }

    // Solar panels (multi, each with its own quantity)
    if (!merged.useCustomSolar && merged.solarPanels.length > 0) {
      for (const panel of merged.solarPanels) {
        const qty = merged.panelQuantities[panel.id] ?? 1;
        panelPrice += panel.priceGBP * qty;
        const perPanelW = (panel.panelWattage ?? 0) *
          (panel.id.includes('rigid') && panel.specs?.Quantity?.includes('2') ? 2 : 1);
        panelW += perPanelW * qty;
      }
    } else if (merged.useCustomSolar && merged.customSolar) {
      panelW = merged.customSolar.sizeValue;
    }

    // Inverters (multi)
    if (!merged.useCustomInverter && merged.inverters.length > 0) {
      for (const inv of merged.inverters) {
        inverterPrice += inv.priceGBP;
      }
    }

    updateConfiguration(configIndex, {
      ...merged,
      totalCost: batteryPrice + panelPrice + inverterPrice,
      totalCapacityWh: batteryWh,
      totalSolarW: panelW,
    });
  }, [config, configIndex, updateConfiguration]);

  const toggleBattery = (product: EcoFlowProduct) => {
    const exists = localBatteries.some(b => b.id === product.id);
    const newLocal = exists
      ? localBatteries.filter(b => b.id !== product.id)
      : [...localBatteries, product];
    setLocalBatteries(newLocal);
  };

  const togglePanel = (product: EcoFlowProduct) => {
    const exists = localSolarPanels.some(p => p.id === product.id);
    const newLocal = exists
      ? localSolarPanels.filter(p => p.id !== product.id)
      : [...localSolarPanels, product];
    setLocalSolarPanels(newLocal);
    const newQty = { ...localPanelQuantities };
    if (!exists) newQty[product.id] = newQty[product.id] ?? 1;
    if (exists) delete newQty[product.id];
    setLocalPanelQuantities(newQty);
  };

  const toggleInverter = (product: EcoFlowProduct) => {
    const exists = localInverters.some(i => i.id === product.id);
    const newLocal = exists
      ? localInverters.filter(i => i.id !== product.id)
      : [...localInverters, product];
    setLocalInverters(newLocal);
  };

  const updatePanelQty = (panelId: string, qty: number) => {
    setLocalPanelQuantities({ ...localPanelQuantities, [panelId]: qty });
  };

  const steps = ['Home Setup', 'Battery Selector', 'Inverters', 'Solar Panels', 'Installation Cost'];

  const cleanSection = (currentStep: number) => {
    if (currentStep === 3 && !config.useCustomSolar) {
      const selectedPanelIds = new Set(localSolarPanels.map(p => p.id));
      const cleanedPanelQuantities = Object.fromEntries(
        Object.entries(localPanelQuantities).filter(([panelId]) => selectedPanelIds.has(panelId)),
      );
      setLocalPanelQuantities(cleanedPanelQuantities);
    }
  };

  const handleCalculateClick = () => {
    // Ensure Installation Cost data is committed before calculating
    if (onCalculate) {
      onCalculate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 0: Home Setup */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Step 1 of {steps.length}</p>
              <h3 className="text-lg font-semibold text-[var(--text-default)]">{steps[0]}</h3>
            </div>
          </div>
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)] mb-3">
            <User className="size-3.5" /> Home Setup
          </Label>
          <EnergyProfileForm />
        </div>
      </div>

      {/* Step 1: Battery Selector */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Step 2 of {steps.length}</p>
              <h3 className="text-lg font-semibold text-[var(--text-default)]">{steps[1]}</h3>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
              <Battery className="size-3.5" /> Battery / Power Station
              {!config.useCustomBattery && localBatteries.length > 0 && (
                <span className="ml-1 rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                  {localBatteries.length}
                </span>
              )}
            </Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-[var(--text-muted)]">Own device</span>
              <Switch
                checked={config.useCustomBattery}
                onCheckedChange={(checked) => {
                  recalcTotals({ useCustomBattery: checked, batteries: checked ? [] : localBatteries });
                  if (checked) setLocalBatteries([]);
                }}
                className="scale-75"
              />
            </label>
          </div>
          {config.useCustomBattery ? (
            <CustomProductForm
              label="Battery"
              sizeUnit="Wh"
              custom={config.customBattery}
              onChange={(cp) => recalcTotals({ customBattery: cp })}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Select one or more batteries/power stations</p>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-default)] mb-2">DELTA Series</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allBatteries.filter(b => b.name.includes('DELTA')).map((b) => (
                    <MultiProductCard
                      key={b.id}
                      product={b}
                      selected={localBatteries.some(sel => sel.id === b.id)}
                      onToggle={toggleBattery}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-default)] mb-2">PowerOcean Series</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allBatteries.filter(b => b.name.includes('PowerOcean')).map((b) => (
                    <MultiProductCard
                      key={b.id}
                      product={b}
                      selected={localBatteries.some(sel => sel.id === b.id)}
                      onToggle={toggleBattery}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-default)] mb-2">Stream Series</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allBatteries.filter(b => b.name.includes('Stream') || b.name.includes('EcoFlow Stream')).map((b) => (
                    <MultiProductCard
                      key={b.id}
                      product={b}
                      selected={localBatteries.some(sel => sel.id === b.id)}
                      onToggle={toggleBattery}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Inverters */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Step 3 of {steps.length}</p>
              <h3 className="text-lg font-semibold text-[var(--text-default)]">{steps[2]}</h3>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
              <Zap className="size-3.5" /> Inverter
              {!config.useCustomInverter && localInverters.length > 0 && (
                <span className="ml-1 rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                  {localInverters.length}
                </span>
              )}
            </Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-[var(--text-muted)]">Own device</span>
              <Switch
                checked={config.useCustomInverter}
                onCheckedChange={(checked) => {
                  recalcTotals({ useCustomInverter: checked, inverters: checked ? [] : localInverters });
                  if (checked) setLocalInverters([]);
                }}
                className="scale-75"
              />
            </label>
          </div>
          {config.useCustomInverter ? (
            <CustomProductForm
              label="Inverter"
              sizeUnit="W"
              custom={config.customInverter}
              onChange={(cp) => recalcTotals({ customInverter: cp })}
            />
          ) : (
            <div className="grid gap-2">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Select inverter(s) or leave empty if not needed</p>
              <div className="grid grid-cols-2 gap-2">
                {allInverters.map((inv) => (
                  <MultiProductCard
                    key={inv.id}
                    product={inv}
                    selected={localInverters.some(sel => sel.id === inv.id)}
                    onToggle={toggleInverter}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
              <Sun className="size-3.5" /> Solar Panels
              {!config.useCustomSolar && localSolarPanels.length > 0 && (
                <span className="ml-1 rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                  {localSolarPanels.length}
                </span>
              )}
            </Label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[10px] text-[var(--text-muted)]">Own device</span>
              <Switch
                checked={config.useCustomSolar}
                onCheckedChange={(checked) => {
                  recalcTotals({ useCustomSolar: checked, solarPanels: checked ? [] : localSolarPanels, panelQuantities: checked ? {} : localPanelQuantities });
                  if (checked) {
                    setLocalSolarPanels([]);
                    setLocalPanelQuantities({});
                  }
                }}
                className="scale-75"
              />
            </label>
          </div>
          {config.useCustomSolar ? (
            <CustomProductForm
              label="Solar Panels"
              sizeUnit="W"
              custom={config.customSolar}
              onChange={(cp) => recalcTotals({ customSolar: cp })}
            />
          ) : (
            <div className="grid gap-2">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">Select one or more solar panel types</p>
              <div className="grid grid-cols-2 gap-2">
                {allPanels.map((p) => (
                  <MultiProductCard
                    key={p.id}
                    product={p}
                    selected={localSolarPanels.some(sel => sel.id === p.id)}
                    onToggle={togglePanel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!config.useCustomSolar && localSolarPanels.length > 0 && (
          <div className="space-y-3">
            <Label className="text-xs font-medium text-[var(--text-subtle)] block">
              Panel Set Quantities
            </Label>
            {localSolarPanels.map((panel) => (
              <div key={panel.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                <p className="text-xs font-medium text-[var(--text-default)] flex-1 min-w-0 truncate">{panel.name}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => updatePanelQty(panel.id, Math.max(1, (localPanelQuantities[panel.id] ?? 1) - 1))}
                    disabled={(localPanelQuantities[panel.id] ?? 1) <= 1}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="font-display text-sm font-bold tabular-nums text-[var(--text-default)] w-6 text-center">
                    {localPanelQuantities[panel.id] ?? 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => updatePanelQty(panel.id, Math.min(10, (localPanelQuantities[panel.id] ?? 1) + 1))}
                    disabled={(localPanelQuantities[panel.id] ?? 1) >= 10}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 4: Installation Cost */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Step 5 of {steps.length}</p>
              <h3 className="text-lg font-semibold text-[var(--text-default)]">{steps[4]}</h3>
            </div>
          </div>
        </div>
        <div>
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)] mb-3">
            <Wrench className="size-3.5" /> Installation Cost
          </Label>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={config.installationCost || ''}
                onChange={(e) => recalcTotals({ installationCost: Number(e.target.value) })}
                className="bg-[var(--bg-surface)] border-[var(--border-default)] text-sm h-9 pl-6 tabular-nums"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">£</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Include any professional installation, wiring, or mounting costs</p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-emphasis)]/20 bg-[var(--color-emphasis)]/5 p-4">
          <p className="text-xs font-medium text-[var(--color-emphasis)] mb-2">System Summary</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-lg font-bold tabular-nums text-[var(--text-default)]">
                {config.totalCapacityWh > 0 ? `${(config.totalCapacityWh / 1000).toFixed(1)}` : '—'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">kWh Storage</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold tabular-nums text-[var(--text-default)]">
                {config.totalSolarW > 0 ? `${(config.totalSolarW / 1000).toFixed(1)}` : '—'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">kWp Solar</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold tabular-nums text-[var(--color-emphasis)]">
                £{(() => {
                  let total = config.totalCost;
                  if (config.useCustomBattery && config.customBattery) total += config.customBattery.cost;
                  if (config.useCustomSolar && config.customSolar) total += config.customSolar.cost;
                  if (config.useCustomInverter && config.customInverter) total += config.customInverter.cost;
                  total += config.installationCost || 0;
                  return total.toLocaleString();
                })()}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Total Cost</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        {onCalculate && (
          <Button size="lg" onClick={handleCalculateClick} className="min-w-[200px]">
            <CalcIcon className="size-4 mr-2" />
            Calculate Payback
          </Button>
        )}
      </div>
    </div>
  );
}
