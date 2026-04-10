import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemConfiguration, EnergyProfile, PaybackResult, SavedCalculation } from '@/types';

interface CalculatorState {
  configurations: SystemConfiguration[];
  activeConfigIndex: number;
  energyProfile: EnergyProfile;
  results: (PaybackResult | null)[];
  savedCalculations: SavedCalculation[];
  comparisonSystems: SavedCalculation[];
  setConfigurations: (configs: SystemConfiguration[]) => void;
  updateConfiguration: (index: number, config: SystemConfiguration) => void;
  addConfiguration: () => void;
  removeConfiguration: (index: number) => void;
  setActiveConfigIndex: (index: number) => void;
  setEnergyProfile: (profile: EnergyProfile) => void;
  setResults: (results: (PaybackResult | null)[]) => void;
  saveCalculation: (calc: SavedCalculation) => void;
  deleteSavedCalculation: (id: string) => void;
  addToComparison: (calc: SavedCalculation) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
}

const defaultEnergyProfile: EnergyProfile = {
  annualConsumptionKwh: 3700,
  monthlyConsumptionKwh: [],
  householdSize: 3,
  hasSolarPanels: true,
  hasEV: false,
  evKwhUsage: 2500,
  hasHeatPump: false,
  heatPumpKwhUsage: 4000,
  roofOrientation: 'south',
  roofPitchDeg: 35,
  region: 'South England',
  tariff: 'agile',
  exportsToGrid: true,
  customExportRate: null,
};

const emptyConfig: SystemConfiguration = {
  id: '',
  name: 'System Design 1',
  batteries: [],
  solarPanels: [],
  panelQuantities: {},
  inverters: [],
  extraBatteries: 0,
  totalCost: 0,
  totalCapacityWh: 0,
  totalSolarW: 0,
  useCustomBattery: false,
  useCustomSolar: false,
  useCustomInverter: false,
  customBattery: null,
  customSolar: null,
  customInverter: null,
  installationCost: 0,
};

const getUniqueId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      configurations: [{ ...emptyConfig, id: crypto.randomUUID() }],
      activeConfigIndex: 0,
      energyProfile: defaultEnergyProfile,
      results: [null],
      savedCalculations: [],
      comparisonSystems: [],

      setConfigurations: (configs) => set({ configurations: configs }),

      updateConfiguration: (index, config) => set((state) => {
        const newConfigs = [...state.configurations];
        newConfigs[index] = config;
        return { configurations: newConfigs };
      }),

      addConfiguration: () => set((state) => {
        if (state.configurations.length >= 3) return state;
        const newConfig = {
          ...emptyConfig,
          id: getUniqueId(),
          name: `System Design ${state.configurations.length + 1}`,
        };
        return {
          configurations: [...state.configurations, newConfig],
          results: [...state.results, null],
        };
      }),

      removeConfiguration: (index) => set((state) => {
        if (state.configurations.length <= 1) return state;
        const newConfigs = state.configurations.filter((_, i) => i !== index);
        const newResults = state.results.filter((_, i) => i !== index);
        return {
          configurations: newConfigs,
          results: newResults,
          activeConfigIndex: Math.min(state.activeConfigIndex, newConfigs.length - 1),
        };
      }),

      setActiveConfigIndex: (index) => set({ activeConfigIndex: index }),

      setEnergyProfile: (profile) => set({ energyProfile: profile }),

      setResults: (results) => set({ results }),

      saveCalculation: (calc) => set((state) => ({
        savedCalculations: [calc, ...state.savedCalculations],
      })),

      deleteSavedCalculation: (id) => set((state) => ({
        savedCalculations: state.savedCalculations.filter(c => c.id !== id),
      })),

      addToComparison: (calc) => set((state) => {
        if (state.comparisonSystems.length >= 3) return state;
        if (state.comparisonSystems.some(s => s.id === calc.id)) return state;
        return { comparisonSystems: [...state.comparisonSystems, calc] };
      }),

      removeFromComparison: (id) => set((state) => ({
        comparisonSystems: state.comparisonSystems.filter(c => c.id !== id),
      })),

      clearComparison: () => set({ comparisonSystems: [] }),
    }),
    { name: 'solar-payback-calculator' }
  )
);
