/**
 * materialsApi.ts
 *
 * Supabase CRUD operations for purchase orders and material logs.
 * RLS automatically scopes all queries to the current user's company.
 */

import { supabase } from '../../../shared/services/supabase';
import type {
  PurchaseOrder,
  PurchaseOrderInsert,
  PurchaseOrderUpdate,
  PurchaseOrderItem,
  PurchaseOrderItemInsert,
  MaterialLog,
} from '../../../shared/types/database.types';

// ─── Purchase Orders ────────────────────────────────────────────────────────

export async function fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(*)')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createPurchaseOrder(
  po: PurchaseOrderInsert,
  items: Omit<PurchaseOrderItemInsert, 'purchase_order_id'>[],
): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .insert(po)
    .select()
    .single();

  if (error) throw error;

  if (items.length > 0) {
    const itemsWithPo = items.map((item) => ({
      ...item,
      purchase_order_id: data.id,
    }));
    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsWithPo);

    if (itemsError) throw itemsError;
  }

  return data;
}

export async function updatePurchaseOrder(
  id: number,
  updates: PurchaseOrderUpdate,
): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePurchaseOrder(id: number): Promise<void> {
  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Material Logs ──────────────────────────────────────────────────────────

export async function fetchMaterialLogs(): Promise<MaterialLog[]> {
  const { data, error } = await supabase
    .from('material_logs')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
