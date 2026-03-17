/**
 * customersApi.ts
 *
 * Supabase CRUD operations for customers. RLS automatically scopes
 * all queries to the current user's company.
 */

import { supabase } from '../../../shared/services/supabase';
import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from '../../../shared/types/database.types';

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchCustomerById(id: number): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCustomer(customer: CustomerInsert): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(id: number, updates: CustomerUpdate): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
