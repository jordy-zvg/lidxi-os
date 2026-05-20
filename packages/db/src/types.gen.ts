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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      automation_rules: {
        Row: {
          actions: Json
          active: boolean
          branch_id: string
          conditions: Json
          created_at: string
          id: string
          name: string
          trigger: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          branch_id: string
          conditions?: Json
          created_at?: string
          id?: string
          name: string
          trigger: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          active?: boolean
          branch_id?: string
          conditions?: Json
          created_at?: string
          id?: string
          name?: string
          trigger?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches_v2: {
        Row: {
          address: string | null
          channels: string[] | null
          created_at: string | null
          hours_json: Json | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          tenant_id: string | null
        }
        Insert: {
          address?: string | null
          channels?: string[] | null
          created_at?: string | null
          hours_json?: Json | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          tenant_id?: string | null
        }
        Update: {
          address?: string | null
          channels?: string[] | null
          created_at?: string | null
          hours_json?: Json | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          source: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      couriers: {
        Row: {
          active: boolean
          created_at: string
          external_id: string | null
          id: string
          name: string
          phone: string | null
          type: string
          vehicle: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          external_id?: string | null
          id?: string
          name: string
          phone?: string | null
          type: string
          vehicle?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          external_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          vehicle?: string | null
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          courier_lat: number | null
          courier_lng: number | null
          courier_name: string | null
          courier_phone: string | null
          courier_photo: string | null
          courier_rating: number | null
          courier_vehicle: string | null
          created_at: string
          eta_seconds: number | null
          id: string
          last_event_at: string
          order_id: string
          plate: string | null
          route_geometry: string | null
          status: string
          updated_at: string
        }
        Insert: {
          courier_lat?: number | null
          courier_lng?: number | null
          courier_name?: string | null
          courier_phone?: string | null
          courier_photo?: string | null
          courier_rating?: number | null
          courier_vehicle?: string | null
          created_at?: string
          eta_seconds?: number | null
          id?: string
          last_event_at?: string
          order_id: string
          plate?: string | null
          route_geometry?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          courier_lat?: number | null
          courier_lng?: number | null
          courier_name?: string | null
          courier_phone?: string | null
          courier_photo?: string | null
          courier_rating?: number | null
          courier_vehicle?: string | null
          created_at?: string
          eta_seconds?: number | null
          id?: string
          last_event_at?: string
          order_id?: string
          plate?: string | null
          route_geometry?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatches: {
        Row: {
          courier_id: string | null
          created_at: string
          delivered_at: string | null
          eta_minutes: number | null
          id: string
          order_id: string
          picked_up_at: string | null
          proof_photo_url: string | null
          provider: string
          quote_amount: number | null
          tracking_url: string | null
        }
        Insert: {
          courier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          eta_minutes?: number | null
          id?: string
          order_id: string
          picked_up_at?: string | null
          proof_photo_url?: string | null
          provider: string
          quote_amount?: number | null
          tracking_url?: string | null
        }
        Update: {
          courier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          eta_minutes?: number | null
          id?: string
          order_id?: string
          picked_up_at?: string | null
          proof_photo_url?: string | null
          provider?: string
          quote_amount?: number | null
          tracking_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          branch_id: string
          created_at: string
          fingerprint_template: string | null
          full_name: string
          id: string
          pin_hash: string
          role: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          branch_id: string
          created_at?: string
          fingerprint_template?: string | null
          full_name: string
          id?: string
          pin_hash: string
          role: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          branch_id?: string
          created_at?: string
          fingerprint_template?: string | null
          full_name?: string
          id?: string
          pin_hash?: string
          role?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_v2: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          last_login: string | null
          name: string
          pin_hash: string
          role: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          last_login?: string | null
          name: string
          pin_hash: string
          role: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          last_login?: string | null
          name?: string
          pin_hash?: string
          role?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_v2_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          branch_id: string
          cost_per_unit: number
          created_at: string
          current_stock: number
          id: string
          min_stock: number
          name: string
          sku: string
          unit: string
          updated_at: string
        }
        Insert: {
          branch_id: string
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          min_stock?: number
          name: string
          sku: string
          unit: string
          updated_at?: string
        }
        Update: {
          branch_id?: string
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          min_stock?: number
          name?: string
          sku?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_channel_prices: {
        Row: {
          channel: string
          menu_item_id: string
          price: number
        }
        Insert: {
          channel: string
          menu_item_id: string
          price: number
        }
        Update: {
          channel?: string
          menu_item_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_channel_prices_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          active: boolean
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          photo_key: string | null
          photo_url: string | null
          restaurant_id: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_key?: string | null
          photo_url?: string | null
          restaurant_id: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_key?: string | null
          photo_url?: string | null
          restaurant_id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          modifiers: Json
          notes: string | null
          order_id: string
          qty: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          modifiers?: Json
          notes?: string | null
          order_id: string
          qty: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          modifiers?: Json
          notes?: string | null
          order_id?: string
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          branch_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          channel: string
          created_at: string
          customer_address: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_fee: number
          dispatched_at: string | null
          external_id: string | null
          id: string
          payment_method: string | null
          payment_ref: string | null
          ready_at: string | null
          sla_deadline: string | null
          status: string
          subtotal: number
          tax: number
          tenant_id: string | null
          total: number
        }
        Insert: {
          accepted_at?: string | null
          branch_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          channel: string
          created_at?: string
          customer_address?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_fee?: number
          dispatched_at?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          payment_ref?: string | null
          ready_at?: string | null
          sla_deadline?: string | null
          status?: string
          subtotal: number
          tax?: number
          tenant_id?: string | null
          total: number
        }
        Update: {
          accepted_at?: string | null
          branch_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          channel?: string
          created_at?: string
          customer_address?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_fee?: number
          dispatched_at?: string | null
          external_id?: string | null
          id?: string
          payment_method?: string | null
          payment_ref?: string | null
          ready_at?: string | null
          sla_deadline?: string | null
          status?: string
          subtotal?: number
          tax?: number
          tenant_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          derived_status: string | null
          error: string | null
          event_id: string
          event_type: string
          id: string
          order_id: string | null
          payload: Json
          processed_at: string | null
          provider: string
          received_at: string
          signature_valid: boolean | null
          tenant_id: string | null
        }
        Insert: {
          derived_status?: string | null
          error?: string | null
          event_id: string
          event_type: string
          id?: string
          order_id?: string | null
          payload: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
          signature_valid?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          derived_status?: string | null
          error?: string | null
          event_id?: string
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
          signature_valid?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          order_id: string | null
          printed_at: string | null
          printer_id: string
          status: string
          template: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          order_id?: string | null
          printed_at?: string | null
          printer_id: string
          status?: string
          template: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          order_id?: string | null
          printed_at?: string | null
          printer_id?: string
          status?: string
          template?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          address: string | null
          branch_id: string
          connection: string
          created_at: string
          id: string
          name: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id: string
          connection: string
          created_at?: string
          id?: string
          name: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string
          connection?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "printers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          inventory_item_id: string
          menu_item_id: string
          quantity: number
        }
        Insert: {
          inventory_item_id: string
          menu_item_id: string
          quantity: number
        }
        Update: {
          inventory_item_id?: string
          menu_item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "recipes_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          brand_color: string | null
          created_at: string
          currency: string
          id: string
          name: string
          slug: string
          tenant_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          created_at?: string
          currency?: string
          id?: string
          name: string
          slug: string
          tenant_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          created_at?: string
          currency?: string
          id?: string
          name?: string
          slug?: string
          tenant_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          auto_closed: boolean
          branch_id: string | null
          branch_id_v2: string | null
          break_minutes: number
          created_at: string
          employee_id: string | null
          employee_id_v2: string | null
          ended_at: string | null
          id: string
          started_at: string
          type: string
        }
        Insert: {
          auto_closed?: boolean
          branch_id?: string | null
          branch_id_v2?: string | null
          break_minutes?: number
          created_at?: string
          employee_id?: string | null
          employee_id_v2?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          type?: string
        }
        Update: {
          auto_closed?: boolean
          branch_id?: string | null
          branch_id_v2?: string | null
          break_minutes?: number
          created_at?: string
          employee_id?: string | null
          employee_id_v2?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_branch_id_v2_fkey"
            columns: ["branch_id_v2"]
            isOneToOne: false
            referencedRelation: "branches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_v2_fkey"
            columns: ["employee_id_v2"]
            isOneToOne: false
            referencedRelation: "employees_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          legal_name: string | null
          metadata: Json | null
          name: string
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          onboarding_step: number | null
          payment_mode: string
          phone: string | null
          plan: string
          rfc: string | null
          slug: string
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          onboarding_step?: number | null
          payment_mode?: string
          phone?: string | null
          plan?: string
          rfc?: string | null
          slug: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          legal_name?: string | null
          metadata?: Json | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          onboarding_step?: number | null
          payment_mode?: string
          phone?: string | null
          plan?: string
          rfc?: string | null
          slug?: string
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_tenants: {
        Row: {
          created_at: string | null
          onboarding_completed: boolean | null
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          onboarding_completed?: boolean | null
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          onboarding_completed?: boolean | null
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tenants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
