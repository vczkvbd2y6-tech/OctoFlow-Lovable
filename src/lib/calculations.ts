import type { SystemConfiguration, EnergyProfile, PaybackResult, MonthlyBreakdown, TariffType } from '@/types';
import { MONTHLY_SOLAR_FACTORS, MONTHLY_CONSUMPTION_FACTORS, MONTH_LABELS, UK_SOLAR_IRRADIANCE_KWH_PER_KWP, ROOF_ORIENTATIONS, TARIFF_OPTIONS } from '@/constants/config';
import { agileImportRates, agileExportRates } from '@/constants/mockData';

function getOrientationFactor(orientation: string): number {
  const found = ROOF_ORIENTATIONS.find(o => o.value === orientation);
  return found ? found.factor : 1.0;
}

function getPitchFactor(pitchDeg: number): number {
  if (pitchDeg >= 30 && pitchDeg <= 40) return 1.0;
  if (pitchDeg >= 20 && pitchDeg < 30) return 0.96;
  if (pitchDeg >= 40 && pitchDeg <= 50) return 0.96;
  if (pitchDeg >= 10 && pitchDeg < 20) return 0.90;
  if (pitchDeg > 50 && pitchDeg <= 60) return 0.90;
  return 0.85;
}

function getAgileAverageImportRate(): number {
  const rates = agileImportRates.map(r => r.rate);
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

function getAgileCheapImportRate(): number {
  const sorted = [...agileImportRates].sort((a, b) => a.rate - b.rate);
  const cheapSlots = sorted.slice(0, 8);
  return cheapSlots.reduce((a, b) => a + b.rate, 0) / cheapSlots.length;
}

function getAgilePeakExportRate(): number {
  const sorted = [...agileExportRates].sort((a, b) => b.rate - a.rate);
  const peakSlots = sorted.slice(0, 8);
  return peakSlots.reduce((a, b) => a + b.rate, 0) / peakSlots.length;
}

function getAgileAverageExportRate(): number {
  const rates = agileExportRates.map(r => r.rate);
  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

function getTariffRates(tariff: TariffType): { avgImport: number; cheapImport: number; peakExport: number; avgExport: number } {
  if (tariff === 'agile') {
    return {
      avgImport: getAgileAverageImportRate(),
      cheapImport: getAgileCheapImportRate(),
      peakExport: getAgilePeakExportRate(),
      avgExport: getAgileAverageExportRate(),
    };
  }
  const tariffOption = TARIFF_OPTIONS.find(t => t.value === tariff)!;
  return {
    avgImport: tariffOption.avgImport,
    cheapImport: tariffOption.cheapImport,
    peakExport: tariffOption.peakExport,
    avgExport: tariffOption.avgExport,
  };
}

export function calculatePayback(
  config: SystemConfiguration,
  profile: EnergyProfile
): PaybackResult {
  // Calculate total system cost from multi-select products
  let systemCost = config.totalCost;
  if (config.useCustomBattery && config.customBattery) {
    systemCost += config.customBattery.cost;
  }
  if (config.useCustomSolar && config.customSolar) {
    systemCost += config.customSolar.cost;
  }
  if (config.useCustomInverter && config.customInverter) {
    systemCost += config.customInverter.cost;
  }
  systemCost += config.installationCost || 0;

  const totalSolarKwp = config.totalSolarW / 1000;
  const orientationFactor = getOrientationFactor(profile.roofOrientation);
  const pitchFactor = getPitchFactor(profile.roofPitchDeg);
  const annualSolarKwh = totalSolarKwp * UK_SOLAR_IRRADIANCE_KWH_PER_KWP * orientationFactor * pitchFactor;

  const batteryCapacityKwh = config.totalCapacityWh / 1000;
  const usableBatteryKwh = batteryCapacityKwh * 0.9;
  const batteryRoundTripEfficiency = 0.92;

  const tariffRates = getTariffRates(profile.tariff);
  const avgImportRate = tariffRates.avgImport;
  const cheapImportRate = tariffRates.cheapImport;
  const canExport = profile.exportsToGrid;
  const peakExportRate = canExport ? (profile.customExportRate ?? tariffRates.peakExport) : 0;
  const avgExportRate = canExport ? (profile.customExportRate ?? tariffRates.avgExport) : 0;

  const monthlyBreakdown: MonthlyBreakdown[] = [];
  let totalAnnualSavings = 0;
  let totalGridExport = 0;
  let totalGridImport = 0;
  let totalSelfConsumption = 0;
  let cumulativeSavingsRunning = 0;

  const withoutSolarAnnualCost = profile.annualConsumptionKwh * (avgImportRate / 100);

  for (let m = 0; m < 12; m++) {
    const monthlySolar = annualSolarKwh * MONTHLY_SOLAR_FACTORS[m];
    const monthlyConsumption = profile.annualConsumptionKwh * MONTHLY_CONSUMPTION_FACTORS[m];

    const directSelfConsumption = Math.min(monthlySolar * 0.45, monthlyConsumption * 0.6);

    const excessSolar = monthlySolar - directSelfConsumption;
    const batteryChargeable = Math.min(excessSolar, usableBatteryKwh * 30 * 0.3);
    const batteryUsable = batteryChargeable * batteryRoundTripEfficiency;

    const totalSelfConsump = directSelfConsumption + batteryUsable;
    const selfConsumptionFromSolar = Math.min(totalSelfConsump, monthlyConsumption);

    const gridExport = monthlySolar - directSelfConsumption - batteryChargeable;
    const positiveGridExport = Math.max(0, gridExport);

    const gridImport = monthlyConsumption - selfConsumptionFromSolar;
    const positiveGridImport = Math.max(0, gridImport);

    const arbitrageSavings = usableBatteryKwh * 30 * 0.15 * ((avgImportRate - cheapImportRate) / 100) * batteryRoundTripEfficiency;

    const importCost = positiveGridImport * (cheapImportRate / 100);
    const exportEarnings = positiveGridExport * (peakExportRate / 100);

    const withoutSolarMonthlyCost = monthlyConsumption * (avgImportRate / 100);
    const withSolarMonthlyCost = importCost - exportEarnings - arbitrageSavings;
    const monthlySavings = withoutSolarMonthlyCost - withSolarMonthlyCost;

    cumulativeSavingsRunning += monthlySavings;
    totalAnnualSavings += monthlySavings;
    totalGridExport += positiveGridExport;
    totalGridImport += positiveGridImport;
    totalSelfConsumption += selfConsumptionFromSolar;

    monthlyBreakdown.push({
      month: MONTH_LABELS[m],
      solarGeneration: Math.round(monthlySolar * 10) / 10,
      selfConsumption: Math.round(selfConsumptionFromSolar * 10) / 10,
      gridExport: Math.round(positiveGridExport * 10) / 10,
      gridImport: Math.round(positiveGridImport * 10) / 10,
      importCost: Math.round(importCost * 100) / 100,
      exportEarnings: Math.round(exportEarnings * 100) / 100,
      netCost: Math.round(withSolarMonthlyCost * 100) / 100,
      savings: Math.round(monthlySavings * 100) / 100,
      cumulativeSavings: Math.round(cumulativeSavingsRunning * 100) / 100,
    });
  }

  const paybackYearsRaw = systemCost / totalAnnualSavings;
  const paybackYears = isFinite(paybackYearsRaw) && paybackYearsRaw >= 0 ? Math.floor(paybackYearsRaw) : 0;
  const paybackMonths = isFinite(paybackYearsRaw) && paybackYearsRaw >= 0 ? Math.round((paybackYearsRaw - paybackYears) * 12) : 0;

  const cumulativeSavings: number[] = [];
  for (let year = 0; year <= 15; year++) {
    cumulativeSavings.push(Math.round(totalAnnualSavings * year * 100) / 100);
  }

  const selfConsumptionPct = annualSolarKwh > 0
    ? Math.round((totalSelfConsumption / annualSolarKwh) * 100)
    : 0;

  const roi10Year = systemCost > 0 && isFinite(totalAnnualSavings) ? ((totalAnnualSavings * 10 - systemCost) / systemCost) * 100 : 0;

  return {
    systemCost,
    annualSavings: isFinite(totalAnnualSavings) ? Math.round(totalAnnualSavings * 100) / 100 : 0,
    paybackYears,
    paybackMonths,
    monthlyBreakdown,
    cumulativeSavings,
    roi10Year: Math.round(roi10Year * 10) / 10,
    avgImportRate: Math.round(avgImportRate * 10) / 10,
    avgExportRate: Math.round(avgExportRate * 10) / 10,
    selfConsumptionPct,
    gridExportKwh: Math.round(totalGridExport),
    gridImportKwh: Math.round(totalGridImport),
    solarGenerationKwh: Math.round(annualSolarKwh),
  };
}

export function formatCurrency(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatCurrencyDecimal(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
