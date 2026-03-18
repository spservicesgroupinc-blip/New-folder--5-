export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address_line1: string
          address_line2: string
          city: string
          created_at: string
          email: string
          id: number
          logo_url: string | null
          name: string
          phone: string
          state: string
          updated_at: string
          website: string
          zip: string
        }
        Insert: {
          address_line1?: string
          address_line2?: string
          city?: string
          created_at?: string
          email?: string
          id?: never
          logo_url?: string | null
          name: string
          phone?: string
          state?: string
          updated_at?: string
          website?: string
          zip?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string
          city?: string
          created_at?: string
          email?: string
          id?: never
          logo_url?: string | null
          name?: string
          phone?: string
          state?: string
          updated_at?: string
          website?: string
          zip?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: number
          created_at: string
          id: number
          invited_by: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: never
          invited_by?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: never
          invited_by?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          company_id: number
          created_at: string
          id: number
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: never
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: never
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          city: string
          company_id: number
          created_at: string
          email: string
          id: number
          name: string
          notes: string
          phone: string
          state: string
          status: string
          updated_at: string
          zip: string
        }
        Insert: {
          address?: string
          city?: string
          company_id: number
          created_at?: string
          email?: string
          id?: never
          name: string
          notes?: string
          phone?: string
          state?: string
          status?: string
          updated_at?: string
          zip?: string
        }
        Update: {
          address?: string
          city?: string
          company_id?: number
          created_at?: string
          email?: string
          id?: never
          name?: string
          notes?: string
          phone?: string
          state?: string
          status?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          company_id: number
          created_at: string
          id: number
          last_seen: Json | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: never
          last_seen?: Json | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: never
          last_seen?: Json | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          actuals: Json | null
          company_id: number
          created_at: string
          customer_id: number | null
          date: string
          estimate_lines: Json | null
          execution_status: string
          expenses: Json
          financials: Json | null
          id: number
          inputs: Json
          inventory_processed: boolean
          invoice_date: string | null
          invoice_lines: Json | null
          invoice_number: string | null
          job_notes: string | null
          materials: Json
          payment_terms: string | null
          pdf_url: string | null
          pricing_mode: string | null
          results: Json
          roof_settings: Json
          scheduled_date: string | null
          site_photos: string[]
          sqft_rates: Json | null
          status: string
          total_value: number
          updated_at: string
          wall_settings: Json
          work_order_lines: Json | null
          work_order_url: string | null
        }
        Insert: {
          actuals?: Json | null
          company_id: number
          created_at?: string
          customer_id?: number | null
          date?: string
          estimate_lines?: Json | null
          execution_status?: string
          expenses?: Json
          financials?: Json | null
          id?: never
          inputs?: Json
          inventory_processed?: boolean
          invoice_date?: string | null
          invoice_lines?: Json | null
          invoice_number?: string | null
          job_notes?: string | null
          materials?: Json
          payment_terms?: string | null
          pdf_url?: string | null
          pricing_mode?: string | null
          results?: Json
          roof_settings?: Json
          scheduled_date?: string | null
          site_photos?: string[]
          sqft_rates?: Json | null
          status?: string
          total_value?: number
          updated_at?: string
          wall_settings?: Json
          work_order_lines?: Json | null
          work_order_url?: string | null
        }
        Update: {
          actuals?: Json | null
          company_id?: number
          created_at?: string
          customer_id?: number | null
          date?: string
          estimate_lines?: Json | null
          execution_status?: string
          expenses?: Json
          financials?: Json | null
          id?: never
          inputs?: Json
          inventory_processed?: boolean
          invoice_date?: string | null
          invoice_lines?: Json | null
          invoice_number?: string | null
          job_notes?: string | null
          materials?: Json
          payment_terms?: string | null
          pdf_url?: string | null
          pricing_mode?: string | null
          results?: Json
          roof_settings?: Json
          scheduled_date?: string | null
          site_photos?: string[]
          sqft_rates?: Json | null
          status?: string
          total_value?: number
          updated_at?: string
          wall_settings?: Json
          work_order_lines?: Json | null
          work_order_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          company_id: number
          created_at: string
          id: number
          name: string
          quantity: number
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          id?: never
          name: string
          quantity?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          id?: never
          name?: string
          quantity?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      material_logs: {
        Row: {
          company_id: number
          created_at: string
          customer_name: string
          date: string
          estimate_id: number | null
          id: number
          logged_by: string | null
          material_name: string
          quantity: number
          unit: string
        }
        Insert: {
          company_id: number
          created_at?: string
          customer_name?: string
          date?: string
          estimate_id?: number | null
          id?: never
          logged_by?: string | null
          material_name: string
          quantity?: number
          unit?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          customer_name?: string
          date?: string
          estimate_id?: number | null
          id?: never
          logged_by?: string | null
          material_name?: string
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_logs_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_loss: {
        Row: {
          chemical_cost: number
          company_id: number
          created_at: string
          customer_name: string
          date_paid: string
          estimate_id: number | null
          id: number
          inventory_cost: number
          invoice_number: string | null
          labor_cost: number
          margin: number
          misc_cost: number
          net_profit: number
          revenue: number
          total_cogs: number
        }
        Insert: {
          chemical_cost?: number
          company_id: number
          created_at?: string
          customer_name?: string
          date_paid?: string
          estimate_id?: number | null
          id?: never
          inventory_cost?: number
          invoice_number?: string | null
          labor_cost?: number
          margin?: number
          misc_cost?: number
          net_profit?: number
          revenue?: number
          total_cogs?: number
        }
        Update: {
          chemical_cost?: number
          company_id?: number
          created_at?: string
          customer_name?: string
          date_paid?: string
          estimate_id?: number | null
          id?: never
          inventory_cost?: number
          invoice_number?: string | null
          labor_cost?: number
          margin?: number
          misc_cost?: number
          net_profit?: number
          revenue?: number
          total_cogs?: number
        }
        Relationships: [
          {
            foreignKeyName: "profit_loss_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profit_loss_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          id: number
          inventory_id: number | null
          purchase_order_id: number
          quantity: number
          total: number
          type: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: never
          inventory_id?: number | null
          purchase_order_id: number
          quantity?: number
          total?: number
          type?: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: never
          inventory_id?: number | null
          purchase_order_id?: number
          quantity?: number
          total?: number
          type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          company_id: number
          created_at: string
          date: string
          id: number
          notes: string | null
          status: string
          total_cost: number
          updated_at: string
          vendor_name: string
        }
        Insert: {
          company_id: number
          created_at?: string
          date?: string
          id?: never
          notes?: string | null
          status?: string
          total_cost?: number
          updated_at?: string
          vendor_name?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          date?: string
          id?: never
          notes?: string | null
          status?: string
          total_cost?: number
          updated_at?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          company_id: number
          created_at: string
          end_time: string | null
          estimate_id: number | null
          id: number
          start_time: string
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string
          end_time?: string | null
          estimate_id?: number | null
          id?: never
          start_time: string
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string
          end_time?: string | null
          estimate_id?: number | null
          id?: never
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_leads: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          name: string
          phone?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          name?: string
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_job: {
        Args: { p_actuals: Json; p_estimate_id: number }
        Returns: Json
      }
      get_user_company_id: { Args: never; Returns: number }
      is_company_admin: { Args: never; Returns: boolean }
      mark_job_paid: { Args: { p_estimate_id: number }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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

export type TrialLead = Database['public']['Tables']['trial_leads']['Row'];
export type TrialLeadInsert = Database['public']['Tables']['trial_leads']['Insert'];

export type MemberRole = CompanyMember['role'];
