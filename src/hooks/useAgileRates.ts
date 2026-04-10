import { useState, useEffect, useCallback } from 'react';

interface OctopusRateResult {
  value_exc_vat: number;
  value_inc_vat: number;
  valid_from: string;
  valid_to: string;
}

interface OctopusResponse {
  count: number;
  results: OctopusRateResult[];
}

export interface LiveAgileRate {
  time: string;
  hour: number;
  minute: number;
  rate: number;
  validFrom: string;
  isNegative: boolean;
}

const REGION_CODES: Record<string, string> = {
  'East England': 'A',
  'East Midlands': 'B',
  'London': 'C',
  'Merseyside & North Wales': 'D',
  'West Midlands': 'E',
  'North East England': 'F',
  'North West England': 'G',
  'South England': 'H',
  'South East England': 'J',
  'South Wales': 'K',
  'South West England': 'L',
  'Yorkshire': 'M',
  'South Scotland': 'N',
  'North Scotland': 'P',
};

const IMPORT_PRODUCT = 'AGILE-24-10-01';
const EXPORT_PRODUCT = 'AGILE-OUTGOING-19-05-13';

function buildUrl(product: string, regionCode: string): string {
  const tariffCode = `E-1R-${product}-${regionCode}`;
  return `https://api.octopus.energy/v1/products/${product}/electricity-tariffs/${tariffCode}/standard-unit-rates/?page_size=96`;
}

function parseRates(results: OctopusRateResult[]): LiveAgileRate[] {
  const sorted = [...results].sort(
    (a, b) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime()
  );

  return sorted.map((r) => {
    const utcDate = new Date(r.valid_from);
    const ukTimeString = utcDate.toLocaleString('en-GB', { timeZone: 'Europe/London', hour12: false });
    const ukDate = new Date(ukTimeString);
    const hour = ukDate.getHours();
    const minute = ukDate.getMinutes();

    return {
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      hour: hour,
      minute: minute,
      rate: r.value_inc_vat,
      validFrom: r.valid_from,
      isNegative: r.value_inc_vat < 0,
    };
  });
}

function getTodayDateStrUK(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

function getTomorrowDateStrUK(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

export function useAgileRates(region: string = 'South England') {
  const [importRates, setImportRates] = useState<LiveAgileRate[]>([]);
  const [exportRates, setExportRates] = useState<LiveAgileRate[]>([]);
  const [tomorrowImportRates, setTomorrowImportRates] = useState<LiveAgileRate[]>([]);
  const [tomorrowExportRates, setTomorrowExportRates] = useState<LiveAgileRate[]>([]);
  const [hasTomorrowRates, setHasTomorrowRates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const regionCode = REGION_CODES[region] || 'C';

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [importRes, exportRes] = await Promise.all([
        fetch(buildUrl(IMPORT_PRODUCT, regionCode)),
        fetch(buildUrl(EXPORT_PRODUCT, regionCode)),
      ]);

      if (!importRes.ok || !exportRes.ok) {
        throw new Error('Failed to fetch rates from Octopus Energy API');
      }

      const importData: OctopusResponse = await importRes.json();
      const exportData: OctopusResponse = await exportRes.json();

      const todayStr = getTodayDateStrUK();
      const tomorrowStr = getTomorrowDateStrUK();

      // Filter today's rates
      const todayImport = importData.results.filter((r) => r.valid_from.startsWith(todayStr));
      const todayExport = exportData.results.filter((r) => r.valid_from.startsWith(todayStr));

      // Filter tomorrow's rates
      const tmrwImport = importData.results.filter((r) => r.valid_from.startsWith(tomorrowStr));
      const tmrwExport = exportData.results.filter((r) => r.valid_from.startsWith(tomorrowStr));

      const importToUse = todayImport.length >= 24 ? todayImport : importData.results.slice(0, 48);
      const exportToUse = todayExport.length >= 24 ? todayExport : exportData.results.slice(0, 48);

      try {
        setImportRates(parseRates(importToUse));
        setExportRates(parseRates(exportToUse));

        const hasTmrw = tmrwImport.length >= 24;
        setHasTomorrowRates(hasTmrw);
        setTomorrowImportRates(hasTmrw ? parseRates(tmrwImport) : []);
        setTomorrowExportRates(hasTmrw ? parseRates(tmrwExport) : []);
      } catch (parseError) {
        console.error('Error parsing rates:', parseError);
        setImportRates([]);
        setExportRates([]);
        setTomorrowImportRates([]);
        setTomorrowExportRates([]);
        setHasTomorrowRates(false);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch Agile rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  }, [regionCode]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    importRates,
    exportRates,
    tomorrowImportRates,
    tomorrowExportRates,
    hasTomorrowRates,
    loading,
    error,
    lastUpdated,
    refetch: fetchRates,
    regions: Object.keys(REGION_CODES),
  };
}
