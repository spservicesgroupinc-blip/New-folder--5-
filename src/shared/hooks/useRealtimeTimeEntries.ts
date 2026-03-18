/**
 * useRealtimeTimeEntries.ts
 *
 * Subscribes to real-time changes on the time_entries table for the current
 * user's company. Admin dashboard receives live crew clock-in/out events.
 * Uses company_id filter for multi-tenant isolation.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { TimeEntry } from '../types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeTimeEntriesOptions {
  companyId: number | null;
  onInsert?: (entry: TimeEntry) => void;
  onUpdate?: (entry: TimeEntry) => void;
  enabled?: boolean;
}

export function useRealtimeTimeEntries({
  companyId,
  onInsert,
  onUpdate,
  enabled = true,
}: UseRealtimeTimeEntriesOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !companyId) return;

    const channel = supabase
      .channel(`time_entries:company_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'time_entries',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => onInsert?.(payload.new as TimeEntry),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'time_entries',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => onUpdate?.(payload.new as TimeEntry),
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [companyId, enabled, onInsert, onUpdate]);
}
