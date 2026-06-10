export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          status: string
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
          status?: string
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
          status?: string
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
      channel_connections: {
        Row: {
          channel: string
          connected_at: string | null
          created_at: string
          credentials: Json
          id: string
          last_error: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          channel: string
          connected_at?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          last_error?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          channel?: string
          connected_at?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          last_error?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_connections_tenant_id_fkey"
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
      deliveries: {
        Row: {
          assigned_at: string | null
          cancel_reason: string | null
          canceled_at: string | null
          courier_lat: number | null
          courier_lng: number | null
          courier_name: string | null
          courier_phone: string | null
          courier_vehicle: string | null
          created_at: string
          delivered_at: string | null
          dropoff_address: Json | null
          dropoff_arrived_at: string | null
          dropoff_eta: string | null
          external_id: string | null
          id: string
          order_id: string
          picked_up_at: string | null
          pickup_address: Json | null
          pickup_arrived_at: string | null
          pickup_eta: string | null
          provider: string
          quote_currency: string
          quote_fee_cents: number
          raw_payload: Json
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          courier_lat?: number | null
          courier_lng?: number | null
          courier_name?: string | null
          courier_phone?: string | null
          courier_vehicle?: string | null
          created_at?: string
          delivered_at?: string | null
          dropoff_address?: Json | null
          dropoff_arrived_at?: string | null
          dropoff_eta?: string | null
          external_id?: string | null
          id?: string
          order_id: string
          picked_up_at?: string | null
          pickup_address?: Json | null
          pickup_arrived_at?: string | null
          pickup_eta?: string | null
          provider: string
          quote_currency?: string
          quote_fee_cents?: number
          raw_payload?: Json
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          courier_lat?: number | null
          courier_lng?: number | null
          courier_name?: string | null
          courier_phone?: string | null
          courier_vehicle?: string | null
          created_at?: string
          delivered_at?: string | null
          dropoff_address?: Json | null
          dropoff_arrived_at?: string | null
          dropoff_eta?: string | null
          external_id?: string | null
          id?: string
          order_id?: string
          picked_up_at?: string | null
          pickup_address?: Json | null
          pickup_arrived_at?: string | null
          pickup_eta?: string | null
          provider?: string
          quote_currency?: string
          quote_fee_cents?: number
          raw_payload?: Json
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_provider_connections: {
        Row: {
          connected_at: string | null
          created_at: string
          credentials: Json
          id: string
          last_error: string | null
          provider: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          last_error?: string | null
          provider: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string
          credentials?: Json
          id?: string
          last_error?: string | null
          provider?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_provider_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "delivery_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      employee_branches: {
        Row: {
          branch_id_v2: string
          created_at: string
          employee_id_v2: string
          id: string
          tenant_id: string
        }
        Insert: {
          branch_id_v2: string
          created_at?: string
          employee_id_v2: string
          id?: string
          tenant_id: string
        }
        Update: {
          branch_id_v2?: string
          created_at?: string
          employee_id_v2?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_branches_branch_id_v2_fkey"
            columns: ["branch_id_v2"]
            isOneToOne: false
            referencedRelation: "branches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_branches_employee_id_v2_fkey"
            columns: ["employee_id_v2"]
            isOneToOne: false
            referencedRelation: "employees_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          fingerprint_enrolled: boolean
          fingerprint_enrolled_at: string | null
          id: string
          last_login: string | null
          name: string
          perm_cancel_tickets: boolean
          perm_discounts: boolean
          perm_edit_inventory: boolean
          perm_open_cash: boolean
          perm_view_reports: boolean
          pin_hash: string
          role: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          fingerprint_enrolled?: boolean
          fingerprint_enrolled_at?: string | null
          id?: string
          last_login?: string | null
          name: string
          perm_cancel_tickets?: boolean
          perm_discounts?: boolean
          perm_edit_inventory?: boolean
          perm_open_cash?: boolean
          perm_view_reports?: boolean
          pin_hash: string
          role: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          fingerprint_enrolled?: boolean
          fingerprint_enrolled_at?: string | null
          id?: string
          last_login?: string | null
          name?: string
          perm_cancel_tickets?: boolean
          perm_discounts?: boolean
          perm_edit_inventory?: boolean
          perm_open_cash?: boolean
          perm_view_reports?: boolean
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
      order_payments: {
        Row: {
          amount_cents: number
          cash_received_cents: number | null
          change_given_cents: number | null
          created_at: string
          employee_id_v2: string | null
          id: string
          method: string
          notes: string | null
          order_id: string
          shift_id: string | null
          tenant_id: string
        }
        Insert: {
          amount_cents: number
          cash_received_cents?: number | null
          change_given_cents?: number | null
          created_at?: string
          employee_id_v2?: string | null
          id?: string
          method: string
          notes?: string | null
          order_id: string
          shift_id?: string | null
          tenant_id: string
        }
        Update: {
          amount_cents?: number
          cash_received_cents?: number | null
          change_given_cents?: number | null
          created_at?: string
          employee_id_v2?: string | null
          id?: string
          method?: string
          notes?: string | null
          order_id?: string
          shift_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_employee_id_v2_fkey"
            columns: ["employee_id_v2"]
            isOneToOne: false
            referencedRelation: "employees_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          branch_id: string
          branch_id_v2: string | null
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
          mp_payment_id: string | null
          mp_preference_id: string | null
          order_type: string
          payment_method: string | null
          payment_ref: string | null
          payment_status: string
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
          branch_id_v2?: string | null
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
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          order_type?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
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
          branch_id_v2?: string | null
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
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          order_type?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: string
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
            foreignKeyName: "orders_branch_id_v2_fkey"
            columns: ["branch_id_v2"]
            isOneToOne: false
            referencedRelation: "branches_v2"
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
      pos_devices: {
        Row: {
          branch_id: string | null
          created_at: string
          device_token_hash: string
          id: string
          last_seen_at: string | null
          name: string
          paired_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          device_token_hash: string
          id?: string
          last_seen_at?: string | null
          name: string
          paired_at?: string
          status?: string
          tenant_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          device_token_hash?: string
          id?: string
          last_seen_at?: string | null
          name?: string
          paired_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_devices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_pairing_codes: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string
          device_name: string
          expires_at: string
          id: string
          tenant_id: string
          used_at: string | null
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string
          device_name: string
          expires_at: string
          id?: string
          tenant_id: string
          used_at?: string | null
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string
          device_name?: string
          expires_at?: string
          id?: string
          tenant_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_pairing_codes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_pairing_codes_tenant_id_fkey"
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
          card_total_cents: number | null
          cash_counted_cents: number | null
          cash_difference_cents: number | null
          cash_expected_cents: number | null
          closed_at: string | null
          closed_by_employee_id_v2: string | null
          created_at: string
          employee_id: string | null
          employee_id_v2: string | null
          ended_at: string | null
          id: string
          opening_float_cents: number
          opening_float_set: boolean
          orders_count: number | null
          started_at: string
          tenant_id: string | null
          total_sold_cents: number | null
          type: string
        }
        Insert: {
          auto_closed?: boolean
          branch_id?: string | null
          branch_id_v2?: string | null
          break_minutes?: number
          card_total_cents?: number | null
          cash_counted_cents?: number | null
          cash_difference_cents?: number | null
          cash_expected_cents?: number | null
          closed_at?: string | null
          closed_by_employee_id_v2?: string | null
          created_at?: string
          employee_id?: string | null
          employee_id_v2?: string | null
          ended_at?: string | null
          id?: string
          opening_float_cents?: number
          opening_float_set?: boolean
          orders_count?: number | null
          started_at?: string
          tenant_id?: string | null
          total_sold_cents?: number | null
          type?: string
        }
        Update: {
          auto_closed?: boolean
          branch_id?: string | null
          branch_id_v2?: string | null
          break_minutes?: number
          card_total_cents?: number | null
          cash_counted_cents?: number | null
          cash_difference_cents?: number | null
          cash_expected_cents?: number | null
          closed_at?: string | null
          closed_by_employee_id_v2?: string | null
          created_at?: string
          employee_id?: string | null
          employee_id_v2?: string | null
          ended_at?: string | null
          id?: string
          opening_float_cents?: number
          opening_float_set?: boolean
          orders_count?: number | null
          started_at?: string
          tenant_id?: string | null
          total_sold_cents?: number | null
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
            foreignKeyName: "shifts_closed_by_employee_id_v2_fkey"
            columns: ["closed_by_employee_id_v2"]
            isOneToOne: false
            referencedRelation: "employees_v2"
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
          {
            foreignKeyName: "shifts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

