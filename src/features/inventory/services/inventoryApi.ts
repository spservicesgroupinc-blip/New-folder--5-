/**
 * inventoryApi.ts
 *
 * Supabase CRUD operations for inventory items. RLS automatically scopes
 * all queries to the current user's company.
 */

import { supabase } from '../../../shared/services/supabase';
import type {
  InventoryItem,
  InventoryItemInsert,
  InventoryItemUpdate,
} from '../../../shared/types/database.types';

export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function createInventoryItem(item: InventoryItemInsert): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInventoryItem(id: number, updates: InventoryItemUpdate): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
