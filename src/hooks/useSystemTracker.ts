import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { SystemConfiguration, EnergyProfile, PaybackResult } from '@/types';

export interface UserSystem {
  id: string;
  user_id: string;
  name: string;
  configuration: SystemConfiguration;
  energy_profile: EnergyProfile;
  projected_result: PaybackResult;
  installation_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyActual {
  id: string;
  system_id: string;
  user_id: string;
  month_date: string;
  actual_import_kwh: number | null;
  actual_import_cost: number | null;
  actual_export_kwh: number | null;
  actual_export_income: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useSystemTracker() {
  const { user, isSubscribed } = useAuth();
  const [currentSystem, setCurrentSystem] = useState<UserSystem | null>(null);
  const [actuals, setActuals] = useState<MonthlyActual[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCurrentSystem = useCallback(async () => {
    if (!user || !isSubscribed) {
      setCurrentSystem(null);
      setActuals([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      console.warn('[useSystemTracker] Supabase client not initialized, skipping system fetch');
      setCurrentSystem(null);
      setActuals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: systems, error } = await supabase
      .from('user_systems')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[useSystemTracker] fetch system error:', error.message);
      setLoading(false);
      return;
    }

    if (systems && systems.length > 0) {
      const system = systems[0] as UserSystem;
      setCurrentSystem(system);

      // Fetch actuals for this system
      const { data: monthlyData, error: actualsError } = await supabase
        .from('user_monthly_actuals')
        .select('*')
        .eq('system_id', system.id)
        .order('month_date', { ascending: true });

      if (actualsError) {
        console.error('[useSystemTracker] fetch actuals error:', actualsError.message);
      } else {
        setActuals((monthlyData || []) as MonthlyActual[]);
      }
    } else {
      setCurrentSystem(null);
      setActuals([]);
    }
    setLoading(false);
  }, [user, isSubscribed]);

  useEffect(() => {
    fetchCurrentSystem();
  }, [fetchCurrentSystem]);

  const saveSystem = useCallback(async (
    name: string,
    configuration: SystemConfiguration,
    energyProfile: EnergyProfile,
    projectedResult: PaybackResult,
    installationDate: string,
  ) => {
    if (!user || !supabase) {
      if (!supabase) console.warn('[useSystemTracker] Supabase client not initialized, cannot save system');
      return null;
    }
    setSaving(true);

    // Unset any existing current system
    await supabase
      .from('user_systems')
      .update({ is_current: false })
      .eq('user_id', user.id)
      .eq('is_current', true);

    const { data, error } = await supabase
      .from('user_systems')
      .insert({
        user_id: user.id,
        name,
        configuration,
        energy_profile: energyProfile,
        projected_result: projectedResult,
        installation_date: installationDate,
        is_current: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[useSystemTracker] save system error:', error.message);
      setSaving(false);
      return null;
    }

    setCurrentSystem(data as UserSystem);
    setActuals([]);
    setSaving(false);
    return data;
  }, [user]);

  const saveActual = useCallback(async (
    monthDate: string,
    data: {
      actual_import_kwh: number | null;
      actual_import_cost: number | null;
      actual_export_kwh: number | null;
      actual_export_income: number | null;
      notes?: string | null;
    },
  ) => {
    if (!user || !currentSystem || !supabase) {
      if (!supabase) console.warn('[useSystemTracker] Supabase client not initialized, cannot save actuals');
      return null;
    }
    setSaving(true);

    // Upsert by system_id + month_date
    const existing = actuals.find(a => a.month_date === monthDate);

    if (existing) {
      const { data: updated, error } = await supabase
        .from('user_monthly_actuals')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[useSystemTracker] update actual error:', error.message);
        setSaving(false);
        return null;
      }
      setActuals(prev => prev.map(a => a.id === existing.id ? updated as MonthlyActual : a));
      setSaving(false);
      return updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('user_monthly_actuals')
        .insert({
          system_id: currentSystem.id,
          user_id: user.id,
          month_date: monthDate,
          ...data,
        })
        .select()
        .single();

      if (error) {
        console.error('[useSystemTracker] insert actual error:', error.message);
        setSaving(false);
        return null;
      }
      setActuals(prev => [...prev, inserted as MonthlyActual].sort(
        (a, b) => new Date(a.month_date).getTime() - new Date(b.month_date).getTime()
      ));
      setSaving(false);
      return inserted;
    }
  }, [user, currentSystem, actuals]);

  const deleteSystem = useCallback(async () => {
    if (!currentSystem || !supabase) {
      if (!supabase) console.warn('[useSystemTracker] Supabase client not initialized, cannot delete system');
      return false;
    }
    setSaving(true);

    const { error } = await supabase
      .from('user_systems')
      .delete()
      .eq('id', currentSystem.id);

    if (error) {
      console.error('[useSystemTracker] delete system error:', error.message);
      setSaving(false);
      return false;
    }

    setCurrentSystem(null);
    setActuals([]);
    setSaving(false);
    return true;
  }, [currentSystem]);

  return {
    currentSystem,
    actuals,
    loading,
    saving,
    saveSystem,
    saveActual,
    deleteSystem,
    refresh: fetchCurrentSystem,
  };
}
