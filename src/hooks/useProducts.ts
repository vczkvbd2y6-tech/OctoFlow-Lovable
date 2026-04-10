import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EcoFlowProduct } from '@/types';
import { ecoFlowProducts as fallbackProducts } from '@/constants/mockData';

interface DbProduct {
  id: string;
  name: string;
  category: string;
  price_gbp: number;
  capacity_wh: number | null;
  output_w: number | null;
  solar_input_w: number | null;
  panel_wattage: number | null;
  efficiency: number | null;
  cycle_life: number | null;
  weight_kg: number | null;
  description: string;
  image: string;
  specs: Record<string, string>;
  is_active: boolean;
  sort_order: number;
}

function dbToEcoFlow(p: DbProduct): EcoFlowProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category as EcoFlowProduct['category'],
    priceGBP: Number(p.price_gbp),
    capacityWh: p.capacity_wh ? Number(p.capacity_wh) : undefined,
    outputW: p.output_w ? Number(p.output_w) : undefined,
    solarInputW: p.solar_input_w ? Number(p.solar_input_w) : undefined,
    panelWattage: p.panel_wattage ? Number(p.panel_wattage) : undefined,
    efficiency: p.efficiency ? Number(p.efficiency) : undefined,
    cycleLife: p.cycle_life ? Number(p.cycle_life) : undefined,
    weightKg: p.weight_kg ? Number(p.weight_kg) : undefined,
    description: p.description,
    image: p.image,
    specs: p.specs || {},
  };
}

export function useProducts() {
  const [products, setProducts] = useState<EcoFlowProduct[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      console.warn('[useProducts] Supabase client not initialized, using fallback products');
      setProducts(fallbackProducts);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.log('[useProducts] Using fallback products', error?.message);
      setProducts(fallbackProducts);
    } else {
      setProducts((data as DbProduct[]).map(dbToEcoFlow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const batteries = products.filter(p => p.category === 'battery' || p.category === 'bundle');
  const solarPanels = products.filter(p => p.category === 'solar-panel');
  const inverters = products.filter(p => p.category === 'inverter');

  return { products, batteries, solarPanels, inverters, loading, refresh: fetchProducts };
}

export function useAdminProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[useAdminProducts] fetch error:', error.message);
    } else {
      setProducts((data || []) as DbProduct[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateProduct = useCallback(async (id: string, updates: Partial<DbProduct>) => {
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[useAdminProducts] update error:', error.message);
      setSaving(false);
      return false;
    }
    await fetchAll();
    setSaving(false);
    return true;
  }, [fetchAll]);

  const createProduct = useCallback(async (product: Omit<DbProduct, 'is_active' | 'sort_order'> & { is_active?: boolean; sort_order?: number }) => {
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .insert({
        ...product,
        is_active: product.is_active ?? true,
        sort_order: product.sort_order ?? products.length + 1,
      });

    if (error) {
      console.error('[useAdminProducts] create error:', error.message);
      setSaving(false);
      return false;
    }
    await fetchAll();
    setSaving(false);
    return true;
  }, [fetchAll, products.length]);

  const deleteProduct = useCallback(async (id: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[useAdminProducts] delete error:', error.message);
      setSaving(false);
      return false;
    }
    await fetchAll();
    setSaving(false);
    return true;
  }, [fetchAll]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    return updateProduct(id, { is_active: isActive } as Partial<DbProduct>);
  }, [updateProduct]);

  return { products, loading, saving, updateProduct, createProduct, deleteProduct, toggleActive, refresh: fetchAll };
}
