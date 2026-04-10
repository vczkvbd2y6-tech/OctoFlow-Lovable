import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      console.error('[useAdmin] check error:', error.message);
      setIsAdmin(false);
    } else {
      setIsAdmin(data !== null && data.length > 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  return { isAdmin, loading };
}
