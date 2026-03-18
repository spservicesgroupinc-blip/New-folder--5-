/**
 * useRealtimeInventory.ts
 *
 * Subscribes to real-time changes on inventory_items and equipment tables
 * for the current user's company. Used by admin dashboard and warehouse
 * views for live stock updates (e.g., when crew completes a job and
 * inventory is deducted).
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { InventoryItem, Equipment } from '../types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeInventoryOptions {
  companyId: number | null;
  onInventoryUpdate?: (item: InventoryItem) => void;
  onEquipmentUpdate?: (item: Equipment) => void;
  enabled?: boolean;
}

export function useRealtimeInventory({
  companyId,
  onInventoryUpdate,
  onEquipmentUpdate,
  enabled = true,
}: UseRealtimeInventoryOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !companyId) return;

    const channel = supabase
      .channel(`inventory:company_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          if (payload.eventType !== 'DELETE') {
            onInventoryUpdate?.(payload.new as InventoryItem);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          if (payload.eventType !== 'DELETE') {
            onEquipmentUpdate?.(payload.new as Equipment);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [companyId, enabled, onInventoryUpdate, onEquipmentUpdate]);
}
