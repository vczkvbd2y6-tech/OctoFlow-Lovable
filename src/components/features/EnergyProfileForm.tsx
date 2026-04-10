import { useCalculatorStore } from '@/stores/calculatorStore';
import { REGIONS, ROOF_ORIENTATIONS, HOUSEHOLD_PROFILES, TARIFF_OPTIONS } from '@/constants/config';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Home, MapPin, Compass, Car, Flame, Gauge, Zap, ArrowUpFromLine, Sun } from 'lucide-react';
import type { TariffType } from '@/types';

export default function EnergyProfileForm() {
  const { energyProfile, setEnergyProfile } = useCalculatorStore();

  const updateProfile = (updates: Partial<typeof energyProfile>) => {
    setEnergyProfile({ ...energyProfile, ...updates });
  };

  const handleHouseholdChange = (size: string) => {
    const profile = HOUSEHOLD_PROFILES.find(p => p.size === Number(size));
    if (profile) {
      let annual = profile.annualKwh;
      if (energyProfile.hasEV) annual += energyProfile.evKwhUsage;
      if (energyProfile.hasHeatPump) annual += energyProfile.heatPumpKwhUsage;
      updateProfile({ householdSize: profile.size, annualConsumptionKwh: annual });
    }
  };

  const selectedTariff = TARIFF_OPTIONS.find(t => t.value === energyProfile.tariff);

  return (
    <div className="space-y-6">
      {/* Tariff Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
          <Zap className="size-3.5" /> Octopus Tariff
        </Label>
        <Select value={energyProfile.tariff} onValueChange={(v: TariffType) => updateProfile({ tariff: v })}>
          <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARIFF_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTariff && (
          <p className="text-[10px] text-[var(--text-muted)]">{selectedTariff.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
            <Home className="size-3.5" /> Household Size
          </Label>
          <Select value={String(energyProfile.householdSize)} onValueChange={handleHouseholdChange}>
            <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOUSEHOLD_PROFILES.map((p) => (
                <SelectItem key={p.size} value={String(p.size)}>
                  {p.label} (~{p.annualKwh.toLocaleString()} kWh/yr)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
            <Gauge className="size-3.5" /> Annual Usage (kWh)
          </Label>
          <Input
            type="number"
            value={energyProfile.annualConsumptionKwh}
            onChange={(e) => updateProfile({ annualConsumptionKwh: Number(e.target.value) })}
            className="bg-[var(--bg-surface)] border-[var(--border-default)] tabular-nums"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
            <MapPin className="size-3.5" /> Region
          </Label>
          <Select value={energyProfile.region} onValueChange={(v) => updateProfile({ region: v })}>
            <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Solar Panels */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
          <Label className="flex items-center gap-2 text-sm text-[var(--text-subtle)] cursor-pointer">
            <Sun className="size-4" /> Solar Panels
          </Label>
          <Switch
            checked={energyProfile.hasSolarPanels}
            onCheckedChange={(checked) => updateProfile({ hasSolarPanels: checked })}
          />
        </div>

        {energyProfile.hasSolarPanels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
                <Compass className="size-3.5" /> Roof Orientation
              </Label>
              <Select value={energyProfile.roofOrientation} onValueChange={(v: typeof energyProfile.roofOrientation) => updateProfile({ roofOrientation: v })}>
                <SelectTrigger className="bg-[var(--bg-surface)] border-[var(--border-default)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOF_ORIENTATIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label} ({Math.round(o.factor * 100)}% efficiency)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between text-xs font-medium text-[var(--text-subtle)]">
                <span>Roof Pitch</span>
                <span className="tabular-nums text-[var(--color-primary)]">{energyProfile.roofPitchDeg}°</span>
              </Label>
              <Slider
                value={[energyProfile.roofPitchDeg]}
                onValueChange={([v]) => updateProfile({ roofPitchDeg: v })}
                min={10}
                max={60}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>10° (flat)</span>
                <span>35° (optimal)</span>
                <span>60° (steep)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Export */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
          <Label className="flex items-center gap-2 text-sm text-[var(--text-subtle)] cursor-pointer">
            <ArrowUpFromLine className="size-4" /> Export to Grid
          </Label>
          <Switch
            checked={energyProfile.exportsToGrid}
            onCheckedChange={(checked) => updateProfile({ exportsToGrid: checked })}
          />
        </div>
        {energyProfile.exportsToGrid && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
              <ArrowUpFromLine className="size-3.5" /> Export Rate (p/kWh)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder={selectedTariff ? String(selectedTariff.avgExport) : '15.0'}
                value={energyProfile.customExportRate ?? ''}
                onChange={(e) => updateProfile({ customExportRate: e.target.value ? Number(e.target.value) : null })}
                className="bg-[var(--bg-surface)] border-[var(--border-default)] tabular-nums max-w-[140px] h-8 text-sm"
              />
              <span className="text-[10px] text-[var(--text-muted)]">
                {energyProfile.customExportRate ? 'Custom rate' : `Default: ${selectedTariff?.avgExport ?? 15}p`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Electric Vehicle */}
        <div className="space-y-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm text-[var(--text-subtle)] cursor-pointer">
              <Car className="size-4" /> Electric Vehicle
            </Label>
            <Switch
              checked={energyProfile.hasEV}
              onCheckedChange={(checked) => {
                if (!checked) {
                  const delta = energyProfile.evKwhUsage;
                  updateProfile({ hasEV: false, annualConsumptionKwh: energyProfile.annualConsumptionKwh - delta });
                } else {
                  updateProfile({ hasEV: true, annualConsumptionKwh: energyProfile.annualConsumptionKwh + energyProfile.evKwhUsage });
                }
              }}
            />
          </div>
          {energyProfile.hasEV && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
                <Car className="size-3" /> Annual kWh Usage
              </Label>
              <Input
                type="number"
                value={energyProfile.evKwhUsage}
                onChange={(e) => {
                  const oldUsage = energyProfile.evKwhUsage;
                  const newUsage = Number(e.target.value);
                  const delta = newUsage - oldUsage;
                  updateProfile({ evKwhUsage: newUsage, annualConsumptionKwh: energyProfile.annualConsumptionKwh + delta });
                }}
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] tabular-nums text-sm h-8"
              />
            </div>
          )}
        </div>

        {/* Heat Pump */}
        <div className="space-y-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm text-[var(--text-subtle)] cursor-pointer">
              <Flame className="size-4" /> Heat Pump
            </Label>
            <Switch
              checked={energyProfile.hasHeatPump}
              onCheckedChange={(checked) => {
                if (!checked) {
                  const delta = energyProfile.heatPumpKwhUsage;
                  updateProfile({ hasHeatPump: false, annualConsumptionKwh: energyProfile.annualConsumptionKwh - delta });
                } else {
                  updateProfile({ hasHeatPump: true, annualConsumptionKwh: energyProfile.annualConsumptionKwh + energyProfile.heatPumpKwhUsage });
                }
              }}
            />
          </div>
          {energyProfile.hasHeatPump && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-subtle)]">
                <Flame className="size-3" /> Annual kWh Usage
              </Label>
              <Input
                type="number"
                value={energyProfile.heatPumpKwhUsage}
                onChange={(e) => {
                  const oldUsage = energyProfile.heatPumpKwhUsage;
                  const newUsage = Number(e.target.value);
                  const delta = newUsage - oldUsage;
                  updateProfile({ heatPumpKwhUsage: newUsage, annualConsumptionKwh: energyProfile.annualConsumptionKwh + delta });
                }}
                className="bg-[var(--bg-elevated)] border-[var(--border-default)] tabular-nums text-sm h-8"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
