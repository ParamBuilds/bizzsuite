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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          asset_code: string
          assigned_to: string | null
          category: string | null
          cost_center_id: string | null
          created_at: string
          current_value: number | null
          department_id: string | null
          depreciation_rate: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          manufacturer: string | null
          model_number: string | null
          name: string
          notes: string | null
          organization_id: string
          plant_id: string | null
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"] | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          asset_code: string
          assigned_to?: string | null
          category?: string | null
          cost_center_id?: string | null
          created_at?: string
          current_value?: number | null
          department_id?: string | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          notes?: string | null
          organization_id: string
          plant_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          asset_code?: string
          assigned_to?: string | null
          category?: string | null
          cost_center_id?: string | null
          created_at?: string
          current_value?: number | null
          department_id?: string | null
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          manufacturer?: string | null
          model_number?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          plant_id?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_of_materials: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          output_quantity: number | null
          product_id: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          output_quantity?: number | null
          product_id: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          output_quantity?: number | null
          product_id?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_of_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          bom_id: string
          component_id: string
          created_at: string
          id: string
          notes: string | null
          quantity: number
          unit: string | null
          wastage_percent: number | null
        }
        Insert: {
          bom_id: string
          component_id: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity: number
          unit?: string | null
          wastage_percent?: number | null
        }
        Update: {
          bom_id?: string
          component_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          wastage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "bill_of_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          currency: string | null
          email: string | null
          gst_enabled: boolean | null
          gstin: string | null
          id: string
          logo_url: string | null
          name: string
          organization_id: string | null
          phone: string | null
          plant_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          gst_enabled?: boolean | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name: string
          organization_id?: string | null
          phone?: string | null
          plant_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          gst_enabled?: boolean | null
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          plant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          budget_amount: number | null
          code: string | null
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          plant_id: string | null
          updated_at: string
        }
        Insert: {
          budget_amount?: number | null
          code?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          plant_id?: string | null
          updated_at?: string
        }
        Update: {
          budget_amount?: number | null
          code?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          plant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          business_id: string
          cost_center_id: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          plant_id: string | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          cost_center_id?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          plant_id?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          cost_center_id?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          plant_id?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          head_user_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          plant_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          plant_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          head_user_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          plant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          business_id: string
          category: Database["public"]["Enums"]["expense_category"]
          cost_center_id: string | null
          created_at: string
          department_id: string | null
          description: string
          expense_date: string
          id: string
          notes: string | null
          organization_id: string | null
          plant_id: string | null
          receipt_url: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          business_id: string
          category: Database["public"]["Enums"]["expense_category"]
          cost_center_id?: string | null
          created_at?: string
          department_id?: string | null
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          plant_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          business_id?: string
          category?: Database["public"]["Enums"]["expense_category"]
          cost_center_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          plant_id?: string | null
          receipt_url?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      export_logs: {
        Row: {
          created_at: string
          export_type: string
          file_name: string | null
          filters: Json | null
          id: string
          organization_id: string | null
          record_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          export_type: string
          file_name?: string | null
          filters?: Json | null
          id?: string
          organization_id?: string | null
          record_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          export_type?: string
          file_name?: string | null
          filters?: Json | null
          id?: string
          organization_id?: string | null
          record_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          created_at: string
          created_by: string | null
          driver_name: string | null
          grn_number: string
          id: string
          inspected_at: string | null
          inspected_by: string | null
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          organization_id: string
          purchase_order_id: string | null
          received_date: string | null
          status: Database["public"]["Enums"]["grn_status"] | null
          updated_at: string
          vehicle_number: string | null
          vendor_id: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          driver_name?: string | null
          grn_number: string
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          organization_id: string
          purchase_order_id?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["grn_status"] | null
          updated_at?: string
          vehicle_number?: string | null
          vendor_id: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          driver_name?: string | null
          grn_number?: string
          id?: string
          inspected_at?: string | null
          inspected_by?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string
          purchase_order_id?: string | null
          received_date?: string | null
          status?: Database["public"]["Enums"]["grn_status"] | null
          updated_at?: string
          vehicle_number?: string | null
          vendor_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      grievance_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string
          priority: string | null
          requester_email: string
          requester_name: string
          requester_phone: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          priority?: string | null
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          priority?: string | null
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievance_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_items: {
        Row: {
          accepted_quantity: number | null
          batch_number: string | null
          created_at: string
          description: string
          expiry_date: string | null
          grn_id: string
          id: string
          inspection_notes: string | null
          lot_number: string | null
          manufacture_date: string | null
          ordered_quantity: number | null
          po_item_id: string | null
          product_id: string | null
          received_quantity: number
          rejected_quantity: number | null
          unit_price: number | null
        }
        Insert: {
          accepted_quantity?: number | null
          batch_number?: string | null
          created_at?: string
          description: string
          expiry_date?: string | null
          grn_id: string
          id?: string
          inspection_notes?: string | null
          lot_number?: string | null
          manufacture_date?: string | null
          ordered_quantity?: number | null
          po_item_id?: string | null
          product_id?: string | null
          received_quantity: number
          rejected_quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          accepted_quantity?: number | null
          batch_number?: string | null
          created_at?: string
          description?: string
          expiry_date?: string | null
          grn_id?: string
          id?: string
          inspection_notes?: string | null
          lot_number?: string | null
          manufacture_date?: string | null
          ordered_quantity?: number | null
          po_item_id?: string | null
          product_id?: string | null
          received_quantity?: number
          rejected_quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      gst_settings: {
        Row: {
          business_id: string
          created_at: string
          default_gst_rate: number | null
          gstin: string | null
          id: string
          legal_name: string | null
          state_code: string | null
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          default_gst_rate?: number | null
          gstin?: string | null
          id?: string
          legal_name?: string | null
          state_code?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          default_gst_rate?: number | null
          gstin?: string | null
          id?: string
          legal_name?: string | null
          state_code?: string | null
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gst_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          gst_amount: number | null
          gst_rate: number | null
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_id: string
          cgst_amount: number | null
          cost_center_id: string | null
          created_at: string
          customer_id: string | null
          discount_amount: number | null
          due_date: string | null
          hsn_sac_code: string | null
          id: string
          igst_amount: number | null
          invoice_number: string
          is_inter_state: boolean | null
          issue_date: string
          locked_at: string | null
          notes: string | null
          organization_id: string | null
          place_of_supply: string | null
          plant_id: string | null
          sgst_amount: number | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_id: string
          cgst_amount?: number | null
          cost_center_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          due_date?: string | null
          hsn_sac_code?: string | null
          id?: string
          igst_amount?: number | null
          invoice_number: string
          is_inter_state?: boolean | null
          issue_date?: string
          locked_at?: string | null
          notes?: string | null
          organization_id?: string | null
          place_of_supply?: string | null
          plant_id?: string | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_id?: string
          cgst_amount?: number | null
          cost_center_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount_amount?: number | null
          due_date?: string | null
          hsn_sac_code?: string | null
          id?: string
          igst_amount?: number | null
          invoice_number?: string
          is_inter_state?: boolean | null
          issue_date?: string
          locked_at?: string | null
          notes?: string | null
          organization_id?: string | null
          place_of_supply?: string | null
          plant_id?: string | null
          sgst_amount?: number | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          actions_taken: string | null
          asset_id: string
          cost: number | null
          created_at: string
          description: string | null
          findings: string | null
          hours_spent: number | null
          id: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_action: string | null
          organization_id: string
          parts_used: Json | null
          performed_by: string | null
          performed_date: string | null
          schedule_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actions_taken?: string | null
          asset_id: string
          cost?: number | null
          created_at?: string
          description?: string | null
          findings?: string | null
          hours_spent?: number | null
          id?: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_action?: string | null
          organization_id: string
          parts_used?: Json | null
          performed_by?: string | null
          performed_date?: string | null
          schedule_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actions_taken?: string | null
          asset_id?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          findings?: string | null
          hours_spent?: number | null
          id?: string
          maintenance_type?: Database["public"]["Enums"]["maintenance_type"]
          next_action?: string | null
          organization_id?: string
          parts_used?: Json | null
          performed_by?: string | null
          performed_date?: string | null
          schedule_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          asset_id: string
          assigned_to: string | null
          checklist: Json | null
          created_at: string
          estimated_cost: number | null
          estimated_hours: number | null
          frequency_days: number | null
          id: string
          is_active: boolean | null
          last_performed: string | null
          maintenance_type:
            | Database["public"]["Enums"]["maintenance_type"]
            | null
          next_due: string | null
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          last_performed?: string | null
          maintenance_type?:
            | Database["public"]["Enums"]["maintenance_type"]
            | null
          next_due?: string | null
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string
          estimated_cost?: number | null
          estimated_hours?: number | null
          frequency_days?: number | null
          id?: string
          is_active?: boolean | null
          last_performed?: string | null
          maintenance_type?:
            | Database["public"]["Enums"]["maintenance_type"]
            | null
          next_due?: string | null
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ncr_reports: {
        Row: {
          assigned_to: string | null
          batch_number: string | null
          closed_at: string | null
          closed_by: string | null
          corrective_action: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          immediate_action: string | null
          inspection_id: string | null
          issue_type: string | null
          ncr_number: string
          organization_id: string
          preventive_action: string | null
          product_id: string | null
          quantity_affected: number | null
          root_cause: string | null
          severity: string | null
          status: Database["public"]["Enums"]["ncr_status"] | null
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          assigned_to?: string | null
          batch_number?: string | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          immediate_action?: string | null
          inspection_id?: string | null
          issue_type?: string | null
          ncr_number: string
          organization_id: string
          preventive_action?: string | null
          product_id?: string | null
          quantity_affected?: number | null
          root_cause?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["ncr_status"] | null
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          assigned_to?: string | null
          batch_number?: string | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          immediate_action?: string | null
          inspection_id?: string | null
          issue_type?: string | null
          ncr_number?: string
          organization_id?: string
          preventive_action?: string | null
          product_id?: string | null
          quantity_affected?: number | null
          root_cause?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["ncr_status"] | null
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ncr_reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "quality_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncr_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncr_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          name: string
          pan: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          state_code: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          pan?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      plants: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          created_at: string
          gstin: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          pincode: string | null
          state: string | null
          state_code: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          pincode?: string | null
          state?: string | null
          state_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          pincode?: string | null
          state?: string | null
          state_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted_at: string | null
          id: string
          ip_address: unknown
          is_granted: boolean | null
          organization_id: string
          purpose: string
          updated_at: string
          user_id: string | null
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          is_granted?: boolean | null
          organization_id: string
          purpose: string
          updated_at?: string
          user_id?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          is_granted?: boolean | null
          organization_id?: string
          purpose?: string
          updated_at?: string
          user_id?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          organization_id: string
          request_type: Database["public"]["Enums"]["privacy_request_type"]
          requester_email: string
          requester_name: string | null
          requester_user_id: string | null
          response_notes: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          request_type: Database["public"]["Enums"]["privacy_request_type"]
          requester_email: string
          requester_name?: string | null
          requester_user_id?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          request_type?: Database["public"]["Enums"]["privacy_request_type"]
          requester_email?: string
          requester_name?: string | null
          requester_user_id?: string | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          actual_end_date: string | null
          actual_start_date: string | null
          approved_at: string | null
          approved_by: string | null
          bom_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_number: string
          organization_id: string
          planned_end_date: string | null
          planned_quantity: number
          planned_start_date: string | null
          plant_id: string | null
          produced_quantity: number | null
          product_id: string
          status: Database["public"]["Enums"]["production_status"] | null
          updated_at: string
          wastage_quantity: number | null
        }
        Insert: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bom_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_number: string
          organization_id: string
          planned_end_date?: string | null
          planned_quantity: number
          planned_start_date?: string | null
          plant_id?: string | null
          produced_quantity?: number | null
          product_id: string
          status?: Database["public"]["Enums"]["production_status"] | null
          updated_at?: string
          wastage_quantity?: number | null
        }
        Update: {
          actual_end_date?: string | null
          actual_start_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bom_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          organization_id?: string
          planned_end_date?: string | null
          planned_quantity?: number
          planned_start_date?: string | null
          plant_id?: string | null
          produced_quantity?: number | null
          product_id?: string
          status?: Database["public"]["Enums"]["production_status"] | null
          updated_at?: string
          wastage_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "bill_of_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      products_or_services: {
        Row: {
          batch_number: string | null
          business_id: string
          cost_price: number | null
          created_at: string
          description: string | null
          expiry_date: string | null
          gst_rate: number | null
          hsn_sac_code: string | null
          id: string
          is_active: boolean | null
          lot_number: string | null
          low_stock_threshold: number | null
          manufacture_date: string | null
          name: string
          organization_id: string | null
          sku: string | null
          stock_quantity: number | null
          type: string | null
          unit_price: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          batch_number?: string | null
          business_id: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          gst_rate?: number | null
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean | null
          lot_number?: string | null
          low_stock_threshold?: number | null
          manufacture_date?: string | null
          name: string
          organization_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          type?: string | null
          unit_price?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          batch_number?: string | null
          business_id?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          gst_rate?: number | null
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean | null
          lot_number?: string | null
          low_stock_threshold?: number | null
          manufacture_date?: string | null
          name?: string
          organization_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          type?: string | null
          unit_price?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_or_services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_or_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_or_services_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          gst_amount: number | null
          gst_rate: number | null
          hsn_sac_code: string | null
          id: string
          product_id: string | null
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          gst_amount?: number | null
          gst_rate?: number | null
          hsn_sac_code?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          gst_amount?: number | null
          gst_rate?: number | null
          hsn_sac_code?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
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
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string | null
          organization_id: string
          plant_id: string | null
          po_number: string
          status: Database["public"]["Enums"]["po_status"] | null
          subtotal: number | null
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number | null
          updated_at: string
          vendor_id: string
          warehouse_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          organization_id: string
          plant_id?: string | null
          po_number: string
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          vendor_id: string
          warehouse_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          organization_id?: string
          plant_id?: string | null
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_inspections: {
        Row: {
          batch_number: string | null
          created_at: string
          failed_quantity: number | null
          id: string
          inspected_by: string | null
          inspection_date: string | null
          inspection_number: string
          notes: string | null
          organization_id: string
          parameters: Json | null
          passed_quantity: number | null
          product_id: string | null
          reference_id: string
          reference_type: string
          result: string | null
          sample_size: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          failed_quantity?: number | null
          id?: string
          inspected_by?: string | null
          inspection_date?: string | null
          inspection_number: string
          notes?: string | null
          organization_id: string
          parameters?: Json | null
          passed_quantity?: number | null
          product_id?: string | null
          reference_id: string
          reference_type: string
          result?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          failed_quantity?: number | null
          id?: string
          inspected_by?: string | null
          inspection_date?: string | null
          inspection_number?: string
          notes?: string | null
          organization_id?: string
          parameters?: Json | null
          passed_quantity?: number | null
          product_id?: string | null
          reference_id?: string
          reference_type?: string
          result?: string | null
          sample_size?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_inspections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          category: Database["public"]["Enums"]["permission_category"]
          id: string
          is_allowed: boolean | null
          role: Database["public"]["Enums"]["enterprise_role"]
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          category: Database["public"]["Enums"]["permission_category"]
          id?: string
          is_allowed?: boolean | null
          role: Database["public"]["Enums"]["enterprise_role"]
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          category?: Database["public"]["Enums"]["permission_category"]
          id?: string
          is_allowed?: boolean | null
          role?: Database["public"]["Enums"]["enterprise_role"]
        }
        Relationships: []
      }
      security_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          severity: string
          source_ip: unknown
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity: string
          source_ip?: unknown
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          severity?: string
          source_ip?: unknown
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ledger: {
        Row: {
          balance_after: number
          batch_number: string | null
          created_at: string
          created_by: string | null
          id: string
          lot_number: string | null
          notes: string | null
          organization_id: string
          product_id: string
          quantity_in: number | null
          quantity_out: number | null
          reference_id: string | null
          reference_type: string | null
          total_value: number | null
          transaction_type: string
          unit_cost: number | null
          warehouse_id: string | null
        }
        Insert: {
          balance_after: number
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          organization_id: string
          product_id: string
          quantity_in?: number | null
          quantity_out?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total_value?: number | null
          transaction_type: string
          unit_cost?: number | null
          warehouse_id?: string | null
        }
        Update: {
          balance_after?: number
          batch_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          organization_id?: string
          product_id?: string
          quantity_in?: number | null
          quantity_out?: number | null
          reference_id?: string | null
          reference_type?: string | null
          total_value?: number | null
          transaction_type?: string
          unit_cost?: number | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_ledger_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_ledger_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          batch_number: string | null
          created_at: string
          id: string
          lot_number: string | null
          notes: string | null
          product_id: string
          quantity: number
          received_quantity: number | null
          transfer_id: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          id?: string
          lot_number?: string | null
          notes?: string | null
          product_id: string
          quantity: number
          received_quantity?: number | null
          transfer_id: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          id?: string
          lot_number?: string | null
          notes?: string | null
          product_id?: string
          quantity?: number
          received_quantity?: number | null
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_or_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          actual_arrival: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_arrival: string | null
          from_warehouse_id: string
          id: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["transfer_status"] | null
          to_warehouse_id: string
          transfer_date: string | null
          transfer_number: string
          updated_at: string
        }
        Insert: {
          actual_arrival?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_arrival?: string | null
          from_warehouse_id: string
          id?: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_warehouse_id: string
          transfer_date?: string | null
          transfer_number: string
          updated_at?: string
        }
        Update: {
          actual_arrival?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_arrival?: string | null
          from_warehouse_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_warehouse_id?: string
          transfer_date?: string | null
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          department_id: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          plant_id: string | null
          role: Database["public"]["Enums"]["enterprise_role"]
          user_id: string
        }
        Insert: {
          department_id?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          plant_id?: string | null
          role: Database["public"]["Enums"]["enterprise_role"]
          user_id: string
        }
        Update: {
          department_id?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          plant_id?: string | null
          role?: Database["public"]["Enums"]["enterprise_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_ifsc: string | null
          bank_name: string | null
          city: string | null
          code: string | null
          contact_name: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          name: string
          notes: string | null
          organization_id: string
          pan: string | null
          payment_terms: number | null
          phone: string | null
          pincode: string | null
          rating: number | null
          state: string | null
          state_code: string | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          code?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name: string
          notes?: string | null
          organization_id: string
          pan?: string | null
          payment_terms?: number | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          city?: string | null
          code?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          pan?: string | null
          payment_terms?: number | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          capacity_units: string | null
          city: string | null
          code: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          plant_id: string | null
          state: string | null
          total_capacity: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity_units?: string | null
          city?: string | null
          code?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          plant_id?: string | null
          state?: string | null
          total_capacity?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity_units?: string | null
          city?: string | null
          code?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          plant_id?: string | null
          state?: string | null
          total_capacity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_business_id: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      has_enterprise_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["enterprise_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["permission_action"]
          _category: Database["public"]["Enums"]["permission_category"]
          _org_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      asset_status:
        | "active"
        | "under_maintenance"
        | "retired"
        | "disposed"
        | "in_repair"
      audit_event_type:
        | "login"
        | "logout"
        | "create"
        | "update"
        | "delete"
        | "export"
        | "approve"
        | "reject"
        | "role_change"
        | "permission_change"
      enterprise_role:
        | "super_admin"
        | "organization_owner"
        | "finance"
        | "sales"
        | "inventory"
        | "hr"
        | "compliance_officer"
        | "auditor"
        | "plant_manager"
        | "staff"
      expense_category:
        | "rent"
        | "utilities"
        | "salaries"
        | "marketing"
        | "supplies"
        | "travel"
        | "other"
      grn_status:
        | "pending"
        | "inspecting"
        | "accepted"
        | "rejected"
        | "partially_accepted"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      maintenance_type: "preventive" | "corrective" | "breakdown" | "predictive"
      ncr_status:
        | "open"
        | "investigating"
        | "corrective_action"
        | "closed"
        | "verified"
      permission_action:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "export"
        | "approve"
      permission_category:
        | "dashboard"
        | "customers"
        | "invoices"
        | "inventory"
        | "expenses"
        | "reports"
        | "settings"
        | "compliance"
        | "audit"
        | "users"
        | "organization"
      po_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "sent"
        | "partially_received"
        | "received"
        | "cancelled"
      privacy_request_type: "access" | "correction" | "deletion" | "portability"
      production_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "on_hold"
        | "cancelled"
      request_status: "pending" | "in_progress" | "completed" | "rejected"
      transfer_status:
        | "draft"
        | "pending"
        | "in_transit"
        | "received"
        | "cancelled"
      user_role: "owner" | "staff"
      vendor_status: "active" | "inactive" | "blacklisted" | "pending_approval"
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
    Enums: {
      asset_status: [
        "active",
        "under_maintenance",
        "retired",
        "disposed",
        "in_repair",
      ],
      audit_event_type: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "export",
        "approve",
        "reject",
        "role_change",
        "permission_change",
      ],
      enterprise_role: [
        "super_admin",
        "organization_owner",
        "finance",
        "sales",
        "inventory",
        "hr",
        "compliance_officer",
        "auditor",
        "plant_manager",
        "staff",
      ],
      expense_category: [
        "rent",
        "utilities",
        "salaries",
        "marketing",
        "supplies",
        "travel",
        "other",
      ],
      grn_status: [
        "pending",
        "inspecting",
        "accepted",
        "rejected",
        "partially_accepted",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      maintenance_type: ["preventive", "corrective", "breakdown", "predictive"],
      ncr_status: [
        "open",
        "investigating",
        "corrective_action",
        "closed",
        "verified",
      ],
      permission_action: [
        "create",
        "read",
        "update",
        "delete",
        "export",
        "approve",
      ],
      permission_category: [
        "dashboard",
        "customers",
        "invoices",
        "inventory",
        "expenses",
        "reports",
        "settings",
        "compliance",
        "audit",
        "users",
        "organization",
      ],
      po_status: [
        "draft",
        "pending_approval",
        "approved",
        "sent",
        "partially_received",
        "received",
        "cancelled",
      ],
      privacy_request_type: ["access", "correction", "deletion", "portability"],
      production_status: [
        "planned",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled",
      ],
      request_status: ["pending", "in_progress", "completed", "rejected"],
      transfer_status: [
        "draft",
        "pending",
        "in_transit",
        "received",
        "cancelled",
      ],
      user_role: ["owner", "staff"],
      vendor_status: ["active", "inactive", "blacklisted", "pending_approval"],
    },
  },
} as const
