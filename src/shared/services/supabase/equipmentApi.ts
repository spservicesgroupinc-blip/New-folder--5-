/**
 * equipmentApi.ts
 *
 * Supabase CRUD for equipment tracking. RLS handles company scoping.
 */

import { supabase } from '../../../shared/services/supabase';
import type {
  Equipment,
  EquipmentInsert,
  EquipmentUpdate,
} from '../../../shared/types/database.types';

export async function fetchEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function createEquipment(item: EquipmentInsert): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEquipment(id: number, updates: EquipmentUpdate): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEquipment(id: number): Promise<void> {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
