/**
 * useRealtimeEstimates.ts
 *
 * Subscribes to real-time changes on the estimates table for the current
 * user's company. Admin sees live job status updates; crew sees assignment
 * changes. Uses company_id filter for multi-tenant isolation.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../../../shared/services/supabase';
import type { Estimate } from '../../../shared/types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeEstimatesOptions {
  companyId: number | null;
  onInsert?: (estimate: Estimate) => void;
  onUpdate?: (estimate: Estimate) => void;
  onDelete?: (old: { id: number }) => void;
  enabled?: boolean;
}

export function useRealtimeEstimates({
  companyId,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeEstimatesOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !companyId) return;

    const channel = supabase
      .channel(`estimates:company_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'estimates',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => onInsert?.(payload.new as Estimate),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'estimates',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => onUpdate?.(payload.new as Estimate),
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'estimates',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => onDelete?.(payload.old as { id: number }),
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [companyId, enabled, onInsert, onUpdate, onDelete]);
}
