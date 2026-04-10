import { useCallback, useEffect, useMemo, useState } from 'react';

const FORECAST_REGION_CODES: Record<string, string> = {
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

const FORECAST_BASE = 'https://agileforecast.co.uk/api';
const HALF_HOURLY_SLOTS_21_DAYS = 21 * 48;

interface ForecastApiPrice {
  date_time: string;
  agile_pred: number;
  agile_low: number;
  agile_high: number;
}

interface ForecastSnapshot {
  name: string;
  created_at: string;
  prices: ForecastApiPrice[];
}

export interface AgileForecastPoint {
  timestamp: number;
  validFrom: string;
  pred: number;
  low: number;
  high: number;
}

function buildForecastUrl(region: string): string {
  const code = FORECAST_REGION_CODES[region] ?? 'C';
  return `${FORECAST_BASE}/${code}/`;
}

export function useAgileForecast(region: string) {
  const [data, setData] = useState<AgileForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(buildForecastUrl(region));
      if (!res.ok) {
        throw new Error(`Forecast API returned ${res.status}`);
      }

      const snapshots: ForecastSnapshot[] = await res.json();
      const latest = snapshots[0];
      if (!latest || !Array.isArray(latest.prices)) {
        throw new Error('Unexpected forecast payload');
      }

      const points = latest.prices
        .slice()
        .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
        .slice(0, HALF_HOURLY_SLOTS_21_DAYS)
        .map((item) => ({
          timestamp: new Date(item.date_time).getTime(),
          validFrom: item.date_time,
          pred: item.agile_pred,
          low: item.agile_low,
          high: item.agile_high,
        }));

      setData(points);
      setLastUpdated(new Date(latest.created_at));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forecast');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    void fetchForecast();
  }, [fetchForecast]);

  const summary = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const min = Math.min(...data.map((d) => d.low));
    const max = Math.max(...data.map((d) => d.high));
    const avg = data.reduce((acc, d) => acc + d.pred, 0) / data.length;
    return { min, max, avg };
  }, [data]);

  return {
    data,
    loading,
    error,
    summary,
    lastUpdated,
    refetch: fetchForecast,
  };
}
