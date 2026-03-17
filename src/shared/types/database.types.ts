/**
 * database.types.ts
 *
 * TypeScript types generated from the Supabase schema.
 * Regenerate with: npx supabase gen types typescript --local > src/shared/types/database.types.ts
 *
 * This is a hand-written version matching 001_schema.sql until the project is
 * linked and auto-generation is available.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          address_line1: string;
          address_line2: string;
          city: string;
          state: string;
          zip: string;
          phone: string;
          email: string;
          website: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          name: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          email?: string;
          website?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          name?: string;
          address_line1?: string;
          address_line2?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          email?: string;
          website?: string;
          logo_url?: string | null;
          updated_at?: string;
        };
      };
      company_members: {
        Row: {
          id: number;
          company_id: number;
          user_id: string;
          role: 'admin' | 'crew' | 'supervisor' | 'technician' | 'helper';
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          user_id: string;
          role?: 'admin' | 'crew' | 'supervisor' | 'technician' | 'helper';
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          user_id?: string;
          role?: 'admin' | 'crew' | 'supervisor' | 'technician' | 'helper';
          invited_by?: string | null;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: number;
          company_id: number;
          name: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          phone: string;
          email: string;
          notes: string;
          status: 'Active' | 'Archived' | 'Lead';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          name: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          email?: string;
          notes?: string;
          status?: 'Active' | 'Archived' | 'Lead';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          email?: string;
          notes?: string;
          status?: 'Active' | 'Archived' | 'Lead';
          updated_at?: string;
        };
      };
      estimates: {
        Row: {
          id: number;
          company_id: number;
          customer_id: number | null;
          date: string;
          status: 'Draft' | 'Work Order' | 'Invoiced' | 'Paid' | 'Archived';
          execution_status: 'Not Started' | 'In Progress' | 'Completed';
          total_value: number;
          invoice_number: string | null;
          invoice_date: string | null;
          payment_terms: string | null;
          scheduled_date: string | null;
          job_notes: string | null;
          inputs: Json;
          results: Json;
          materials: Json;
          wall_settings: Json;
          roof_settings: Json;
          expenses: Json;
          pricing_mode: string | null;
          sqft_rates: Json | null;
          estimate_lines: Json | null;
          invoice_lines: Json | null;
          work_order_lines: Json | null;
          actuals: Json | null;
          financials: Json | null;
          inventory_processed: boolean;
          pdf_url: string | null;
          work_order_url: string | null;
          site_photos: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          customer_id?: number | null;
          date?: string;
          status?: 'Draft' | 'Work Order' | 'Invoiced' | 'Paid' | 'Archived';
          execution_status?: 'Not Started' | 'In Progress' | 'Completed';
          total_value?: number;
          invoice_number?: string | null;
          invoice_date?: string | null;
          payment_terms?: string | null;
          scheduled_date?: string | null;
          job_notes?: string | null;
          inputs?: Json;
          results?: Json;
          materials?: Json;
          wall_settings?: Json;
          roof_settings?: Json;
          expenses?: Json;
          pricing_mode?: string | null;
          sqft_rates?: Json | null;
          estimate_lines?: Json | null;
          invoice_lines?: Json | null;
          work_order_lines?: Json | null;
          actuals?: Json | null;
          financials?: Json | null;
          inventory_processed?: boolean;
          pdf_url?: string | null;
          work_order_url?: string | null;
          site_photos?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          customer_id?: number | null;
          date?: string;
          status?: 'Draft' | 'Work Order' | 'Invoiced' | 'Paid' | 'Archived';
          execution_status?: 'Not Started' | 'In Progress' | 'Completed';
          total_value?: number;
          invoice_number?: string | null;
          invoice_date?: string | null;
          payment_terms?: string | null;
          scheduled_date?: string | null;
          job_notes?: string | null;
          inputs?: Json;
          results?: Json;
          materials?: Json;
          wall_settings?: Json;
          roof_settings?: Json;
          expenses?: Json;
          pricing_mode?: string | null;
          sqft_rates?: Json | null;
          estimate_lines?: Json | null;
          invoice_lines?: Json | null;
          work_order_lines?: Json | null;
          actuals?: Json | null;
          financials?: Json | null;
          inventory_processed?: boolean;
          pdf_url?: string | null;
          work_order_url?: string | null;
          site_photos?: string[];
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: number;
          company_id: number;
          name: string;
          quantity: number;
          unit: string;
          unit_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          name: string;
          quantity?: number;
          unit?: string;
          unit_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          name?: string;
          quantity?: number;
          unit?: string;
          unit_cost?: number;
          updated_at?: string;
        };
      };
      equipment: {
        Row: {
          id: number;
          company_id: number;
          name: string;
          status: 'Available' | 'In Use' | 'Maintenance' | 'Lost';
          last_seen: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          name: string;
          status?: 'Available' | 'In Use' | 'Maintenance' | 'Lost';
          last_seen?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          name?: string;
          status?: 'Available' | 'In Use' | 'Maintenance' | 'Lost';
          last_seen?: Json | null;
          updated_at?: string;
        };
      };
      company_settings: {
        Row: {
          id: number;
          company_id: number;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          key: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      profit_loss: {
        Row: {
          id: number;
          company_id: number;
          estimate_id: number | null;
          date_paid: string;
          customer_name: string;
          invoice_number: string | null;
          revenue: number;
          chemical_cost: number;
          labor_cost: number;
          inventory_cost: number;
          misc_cost: number;
          total_cogs: number;
          net_profit: number;
          margin: number;
          created_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          estimate_id?: number | null;
          date_paid?: string;
          customer_name?: string;
          invoice_number?: string | null;
          revenue?: number;
          chemical_cost?: number;
          labor_cost?: number;
          inventory_cost?: number;
          misc_cost?: number;
          total_cogs?: number;
          net_profit?: number;
          margin?: number;
          created_at?: string;
        };
        Update: never;
      };
      material_logs: {
        Row: {
          id: number;
          company_id: number;
          estimate_id: number | null;
          date: string;
          customer_name: string;
          material_name: string;
          quantity: number;
          unit: string;
          logged_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          estimate_id?: number | null;
          date?: string;
          customer_name?: string;
          material_name: string;
          quantity?: number;
          unit?: string;
          logged_by?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      time_entries: {
        Row: {
          id: number;
          company_id: number;
          estimate_id: number | null;
          user_id: string;
          start_time: string;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          estimate_id?: number | null;
          user_id: string;
          start_time: string;
          end_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          estimate_id?: number | null;
          user_id?: string;
          start_time?: string;
          end_time?: string | null;
        };
      };
      purchase_orders: {
        Row: {
          id: number;
          company_id: number;
          date: string;
          vendor_name: string;
          status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
          total_cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          company_id: number;
          date?: string;
          vendor_name?: string;
          status?: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          company_id?: number;
          date?: string;
          vendor_name?: string;
          status?: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
          total_cost?: number;
          notes?: string | null;
          updated_at?: string;
        };
      };
      purchase_order_items: {
        Row: {
          id: number;
          purchase_order_id: number;
          description: string;
          quantity: number;
          unit_cost: number;
          total: number;
          type: 'open_cell' | 'closed_cell' | 'inventory';
          inventory_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          purchase_order_id: number;
          description?: string;
          quantity?: number;
          unit_cost?: number;
          total?: number;
          type?: 'open_cell' | 'closed_cell' | 'inventory';
          inventory_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          purchase_order_id?: number;
          description?: string;
          quantity?: number;
          unit_cost?: number;
          total?: number;
          type?: 'open_cell' | 'closed_cell' | 'inventory';
          inventory_id?: number | null;
        };
      };
    };
    Functions: {
      get_user_company_id: {
        Args: Record<string, never>;
        Returns: number;
      };
      is_company_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      complete_job: {
        Args: {
          p_estimate_id: number;
          p_actuals: Json;
        };
        Returns: Json;
      };
      mark_job_paid: {
        Args: {
          p_estimate_id: number;
        };
        Returns: Json;
      };
    };
  };
}

// ─── Convenience row aliases ────────────────────────────────────────────────

export type Company = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export type CompanyMember = Database['public']['Tables']['company_members']['Row'];
export type CompanyMemberInsert = Database['public']['Tables']['company_members']['Insert'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type Estimate = Database['public']['Tables']['estimates']['Row'];
export type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
export type EstimateUpdate = Database['public']['Tables']['estimates']['Update'];

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];

export type Equipment = Database['public']['Tables']['equipment']['Row'];
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update'];

export type CompanySetting = Database['public']['Tables']['company_settings']['Row'];

export type ProfitLoss = Database['public']['Tables']['profit_loss']['Row'];
export type ProfitLossInsert = Database['public']['Tables']['profit_loss']['Insert'];

export type MaterialLog = Database['public']['Tables']['material_logs']['Row'];
export type MaterialLogInsert = Database['public']['Tables']['material_logs']['Insert'];

export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert'];

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert'];
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update'];

export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row'];
export type PurchaseOrderItemInsert = Database['public']['Tables']['purchase_order_items']['Insert'];

export type MemberRole = CompanyMember['role'];
