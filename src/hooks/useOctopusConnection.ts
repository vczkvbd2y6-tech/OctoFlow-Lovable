import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface OctopusMeter {
  id: string;
  fuel_type: 'electricity' | 'gas';
  mpan_mprn: string;
  serial_number: string;
  tariff_code: string | null;
  is_export: boolean;
}

export interface OctopusStatus {
  connected: boolean;
  account_number?: string;
  status?: string;
  last_synced_at?: string;
  sync_status?: string;
  sync_error?: string;
  connected_at?: string;
  meters?: OctopusMeter[];
  usage_days_stored?: number;
}

export interface TariffComparison {
  tariff: string;
  value: string;
  avgRate: number;
  annualCostEstimate: number;
  monthlyCostEstimate: number;
  isCurrent: boolean;
}

export interface CompareResult {
  annualized_kwh: number;
  days_of_data: number;
  monthly_usage: { month: string; kwh: number }[];
  detected_tariff: string;
  current_tariff_code: string;
  comparisons: TariffComparison[];
  cheapest_tariff: string;
  potential_annual_saving: number | null;
}

async function invokeOctopus(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('octopus-integration', { body });
  if (error) {
    let msg = error.message;
    if (error instanceof FunctionsHttpError) {
      try { msg = (await error.context?.text()) || msg; } catch { /* */ }
      try { const p = JSON.parse(msg); msg = p.error || msg; } catch { /* */ }
    }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useOctopusConnection() {
  const { user, isSubscribed } = useAuth();
  const [status, setStatus] = useState<OctopusStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user || !isSubscribed) return;
    setLoading(true);
    try {
      const data = await invokeOctopus({ action: 'status' });
      setStatus(data as OctopusStatus);
    } catch (err) {
      console.error('Octopus status error:', err);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, [user, isSubscribed]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const connect = async (accountNumber: string, apiKey: string) => {
    const data = await invokeOctopus({ action: 'connect', accountNumber, apiKey });
    await fetchStatus();
    return data;
  };

  const disconnect = async () => {
    await invokeOctopus({ action: 'disconnect' });
    setStatus({ connected: false });
    setCompareResult(null);
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const data = await invokeOctopus({ action: 'sync' });
      await fetchStatus();
      return data;
    } finally {
      setSyncing(false);
    }
  };

  const compare = async () => {
    setComparing(true);
    try {
      const data = await invokeOctopus({ action: 'compare' });
      setCompareResult(data as CompareResult);
      return data;
    } finally {
      setComparing(false);
    }
  };

  return {
    status,
    loading,
    syncing,
    comparing,
    compareResult,
    connect,
    disconnect,
    sync,
    compare,
    refresh: fetchStatus,
  };
}
