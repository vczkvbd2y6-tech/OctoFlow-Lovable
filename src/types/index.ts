export interface EcoFlowProduct {
  id: string;
  name: string;
  category: 'battery' | 'solar-panel' | 'inverter' | 'bundle';
  priceGBP: number;
  capacityWh?: number;
  outputW?: number;
  solarInputW?: number;
  panelWattage?: number;
  efficiency?: number;
  cycleLife?: number;
  weightKg?: number;
  description: string;
  image: string;
  specs: Record<string, string>;
  affiliateLink?: string;
}

export interface CustomProduct {
  name: string;
  sizeValue: number;
  sizeUnit: string;
  cost: number;
}

export type TariffType = 'agile' | 'fixed' | 'tracker';

export interface SystemConfiguration {
  id: string;
  name: string;
  batteries: EcoFlowProduct[];
  solarPanels: EcoFlowProduct[];
  panelQuantities: Record<string, number>;
  inverters: EcoFlowProduct[];
  extraBatteries: number;
  totalCost: number;
  totalCapacityWh: number;
  totalSolarW: number;
  useCustomBattery: boolean;
  useCustomSolar: boolean;
  useCustomInverter: boolean;
  customBattery: CustomProduct | null;
  customSolar: CustomProduct | null;
  customInverter: CustomProduct | null;
  installationCost: number;
  /** @deprecated kept for saved-calculation back-compat */
  battery?: EcoFlowProduct | null;
  /** @deprecated kept for saved-calculation back-compat */
  inverter?: EcoFlowProduct | null;
}

export interface EnergyProfile {
  annualConsumptionKwh: number;
  monthlyConsumptionKwh: number[];
  householdSize: number;
  hasSolarPanels: boolean;
  hasEV: boolean;
  evKwhUsage: number;
  hasHeatPump: boolean;
  heatPumpKwhUsage: number;
  roofOrientation: 'south' | 'south-east' | 'south-west' | 'east' | 'west';
  roofPitchDeg: number;
  region: string;
  tariff: TariffType;
  exportsToGrid: boolean;
  customExportRate: number | null;
}

export interface AgileRate {
  time: string;
  hour: number;
  minute: number;
  rate: number;
  isExport: boolean;
}

export interface PaybackResult {
  systemCost: number;
  annualSavings: number;
  paybackYears: number;
  paybackMonths: number;
  monthlyBreakdown: MonthlyBreakdown[];
  cumulativeSavings: number[];
  roi10Year: number;
  avgImportRate: number;
  avgExportRate: number;
  selfConsumptionPct: number;
  gridExportKwh: number;
  gridImportKwh: number;
  solarGenerationKwh: number;
}

export interface MonthlyBreakdown {
  month: string;
  solarGeneration: number;
  selfConsumption: number;
  gridExport: number;
  gridImport: number;
  importCost: number;
  exportEarnings: number;
  netCost: number;
  savings: number;
  cumulativeSavings: number;
}

export interface SavedCalculation {
  id: string;
  name: string;
  date: string;
  configuration: SystemConfiguration;
  energyProfile: EnergyProfile;
  result: PaybackResult;
}
