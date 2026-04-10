export const APP_NAME = 'OctoFlow';
export const APP_DESCRIPTION = 'Calculate your EcoFlow solar & battery payback period on Octopus Energy tariffs';

export const REGIONS = [
  'South England',
  'North England',
  'Midlands',
  'South Wales',
  'North Wales',
  'Scotland',
  'East England',
  'South West England',
] as const;

export const ROOF_ORIENTATIONS = [
  { value: 'south', label: 'South', factor: 1.0 },
  { value: 'south-east', label: 'South-East', factor: 0.94 },
  { value: 'south-west', label: 'South-West', factor: 0.94 },
  { value: 'east', label: 'East', factor: 0.82 },
  { value: 'west', label: 'West', factor: 0.82 },
] as const;

export const HOUSEHOLD_PROFILES = [
  { size: 1, label: '1 person', annualKwh: 1800 },
  { size: 2, label: '2 people', annualKwh: 2900 },
  { size: 3, label: '3 people', annualKwh: 3700 },
  { size: 4, label: '4 people', annualKwh: 4100 },
  { size: 5, label: '5+ people', annualKwh: 4600 },
];

export const MONTHLY_SOLAR_FACTORS = [
  0.03, 0.05, 0.08, 0.10, 0.12, 0.13,
  0.13, 0.12, 0.09, 0.07, 0.04, 0.03,
];

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTHLY_CONSUMPTION_FACTORS = [
  0.11, 0.10, 0.09, 0.08, 0.07, 0.06,
  0.06, 0.07, 0.08, 0.09, 0.10, 0.11,
];

export const UK_SOLAR_IRRADIANCE_KWH_PER_KWP = 900;

export const AGILE_STANDING_CHARGE_PENCE = 53.35;

export const OCTOPUS_EXPORT_FIXED_RATE = 12;

export const TARIFF_OPTIONS = [
  {
    value: 'agile' as const,
    label: 'Octopus Agile',
    description: 'Half-hourly variable rates. Cheapest overnight, expensive 4–7pm peak.',
    avgImport: 18.5,
    avgExport: 9.3,
    cheapImport: 6.5,
    peakExport: 18.0,
  },
  {
    value: 'fixed' as const,
    label: 'Octopus Fixed',
    description: 'Fixed unit rate for 12 months. Predictable, no half-hourly variation.',
    avgImport: 24.5,
    avgExport: 15.0,
    cheapImport: 24.5,
    peakExport: 15.0,
  },
  {
    value: 'tracker' as const,
    label: 'Octopus Tracker',
    description: 'Daily variable rate that tracks wholesale prices. Changes once per day.',
    avgImport: 20.2,
    avgExport: 10.5,
    cheapImport: 12.0,
    peakExport: 15.5,
  },
];

export const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Compare Tariffs', path: '/tariffs' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
];

export const PRO_MONTHLY_PRICE_GBP = 0.75;
export const LIFETIME_PRO_PRICE_GBP = 5;
export const FREE_CALCULATION_LIMIT = 3;

// Stripe price IDs
export const STRIPE_PRO_MONTHLY_PRICE_ID = 'price_1TJvyGCayVIz9m5dR7dycE36';
export const STRIPE_LIFETIME_PRO_PRICE_ID = 'price_1TJvyHCayVIz9m5dcOFl1nxw';
