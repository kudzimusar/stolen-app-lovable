export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      device_verifications: {
        Row: {
          id: string
          device_id: string
          verification_method: string
          verifier_name: string
          confidence_score: number
          verification_timestamp: string
          status: string
          verification_details: Json | null
          blockchain_tx_id: string | null
          verified_by_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          verification_method: string
          verifier_name: string
          confidence_score: number
          verification_timestamp?: string
          status?: string
          verification_details?: Json | null
          blockchain_tx_id?: string | null
          verified_by_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          verification_method?: string
          verifier_name?: string
          confidence_score?: number
          verification_timestamp?: string
          status?: string
          verification_details?: Json | null
          blockchain_tx_id?: string | null
          verified_by_user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_verifications_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      device_certificates: {
        Row: {
          id: string
          device_id: string
          certificate_type: string
          issuer: string
          issue_date: string
          expiry_date: string | null
          certificate_url: string | null
          certificate_data: Json | null
          verification_status: string
          is_active: boolean
          verified_by_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          certificate_type: string
          issuer: string
          issue_date?: string
          expiry_date?: string | null
          certificate_url?: string | null
          certificate_data?: Json | null
          verification_status?: string
          is_active?: boolean
          verified_by_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          certificate_type?: string
          issuer?: string
          issue_date?: string
          expiry_date?: string | null
          certificate_url?: string | null
          certificate_data?: Json | null
          verification_status?: string
          is_active?: boolean
          verified_by_user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_certificates_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      device_risk_assessment: {
        Row: {
          id: string
          device_id: string
          risk_score: number
          risk_status: string
          risk_factors: string[] | null
          assessment_date: string
          assessed_by: string
          assessment_notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          risk_score: number
          risk_status: string
          risk_factors?: string[] | null
          assessment_date?: string
          assessed_by: string
          assessment_notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          risk_score?: number
          risk_status?: string
          risk_factors?: string[] | null
          assessment_date?: string
          assessed_by?: string
          assessment_notes?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_risk_assessment_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      seller_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          business_name: string | null
          verification_status: string
          is_premium: boolean
          rating: number
          total_sales: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          business_name?: string | null
          verification_status?: string
          is_premium?: boolean
          rating?: number
          total_sales?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          business_name?: string | null
          verification_status?: string
          is_premium?: boolean
          rating?: number
          total_sales?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      ai_scores: {
        Row: {
          ai_model_version: string | null
          analysis_timestamp: string | null
          confidence_score: number | null
          created_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          fraud_indicators: Json | null
          id: string
        }
        Insert: {
          ai_model_version?: string | null
          analysis_timestamp?: string | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          fraud_indicators?: Json | null
          id?: string
        }
        Update: {
          ai_model_version?: string | null
          analysis_timestamp?: string | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          fraud_indicators?: Json | null
          id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          blockchain_hash: string | null
          storage_capacity: string | null
          ram_gb: number | null
          processor: string | null
          screen_size_inch: number | null
          battery_health_percentage: number | null
          device_condition: string | null
          warranty_months: number | null
          warranty_expiry_date: string | null
          proof_of_purchase_url: string | null
          user_identity_url: string | null
          warranty_document_url: string | null
          registration_certificate_url: string | null
          blockchain_verified_at: string | null
          registration_location_address: string | null
          registration_location_lat: number | null
          registration_location_lng: number | null
          serial_status: string | null
          verification_level: string | null
          trust_score: number | null
          is_marketplace_eligible: boolean | null

          brand: string
          color: string | null
          created_at: string | null
          current_owner_id: string | null
          device_name: string
          device_photos: string[] | null
          id: string
          imei: string | null
          insurance_policy_id: string | null
          last_seen_location: unknown | null
          model: string
          purchase_date: string | null
          purchase_price: number | null
          receipt_url: string | null
          registration_date: string | null
          serial_number: string
          status: Database["public"]["Enums"]["device_status"] | null
          updated_at: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          storage_capacity?: string | null
          ram_gb?: number | null
          processor?: string | null
          screen_size_inch?: number | null
          battery_health_percentage?: number | null
          device_condition?: string | null
          warranty_months?: number | null
          warranty_expiry_date?: string | null
          proof_of_purchase_url?: string | null
          user_identity_url?: string | null
          warranty_document_url?: string | null
          registration_certificate_url?: string | null
          blockchain_verified_at?: string | null
          registration_location_address?: string | null
          registration_location_lat?: number | null
          registration_location_lng?: number | null
          serial_status?: string | null
          verification_level?: string | null
          trust_score?: number | null
          is_marketplace_eligible?: boolean | null

          storage_capacity?: string | null
          ram_gb?: number | null
          processor?: string | null
          screen_size_inch?: number | null
          battery_health_percentage?: number | null
          device_condition?: string | null
          warranty_months?: number | null
          warranty_expiry_date?: string | null
          proof_of_purchase_url?: string | null
          user_identity_url?: string | null
          warranty_document_url?: string | null
          registration_certificate_url?: string | null
          blockchain_verified_at?: string | null
          registration_location_address?: string | null
          registration_location_lat?: number | null
          registration_location_lng?: number | null
          serial_status?: string | null
          verification_level?: string | null
          trust_score?: number | null
          is_marketplace_eligible?: boolean | null

          brand: string
          color?: string | null
          created_at?: string | null
          current_owner_id?: string | null
          device_name: string
          device_photos?: string[] | null
          id?: string
          imei?: string | null
          insurance_policy_id?: string | null
          last_seen_location?: unknown | null
          model: string
          purchase_date?: string | null
          purchase_price?: number | null
          receipt_url?: string | null
          registration_date?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["device_status"] | null
          updated_at?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          brand?: string
          color?: string | null
          created_at?: string | null
          current_owner_id?: string | null
          device_name?: string
          device_photos?: string[] | null
          id?: string
          imei?: string | null
          insurance_policy_id?: string | null
          last_seen_location?: unknown | null
          model?: string
          purchase_date?: string | null
          purchase_price?: number | null
          receipt_url?: string | null
          registration_date?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["device_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_current_owner_id_fkey"
            columns: ["current_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          amount: number
          arbitrator_id: string | null
          buyer_id: string | null
          created_at: string | null
          currency: string | null
          dispute_reason: string | null
          id: string
          listing_id: string | null
          release_condition: string | null
          released_at: string | null
          seller_id: string | null
          status: Database["public"]["Enums"]["escrow_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          arbitrator_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          dispute_reason?: string | null
          id?: string
          listing_id?: string | null
          release_condition?: string | null
          released_at?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["escrow_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          arbitrator_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          currency?: string | null
          dispute_reason?: string | null
          id?: string
          listing_id?: string | null
          release_condition?: string | null
          released_at?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["escrow_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_arbitrator_id_fkey"
            columns: ["arbitrator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      found_tips: {
        Row: {
          anonymous: boolean | null
          contact_method: string | null
          created_at: string | null
          finder_id: string | null
          found_location: unknown | null
          id: string
          reward_claimed: boolean | null
          stolen_report_id: string | null
          tip_description: string | null
          verified: boolean | null
        }
        Insert: {
          anonymous?: boolean | null
          contact_method?: string | null
          created_at?: string | null
          finder_id?: string | null
          found_location?: unknown | null
          id?: string
          reward_claimed?: boolean | null
          stolen_report_id?: string | null
          tip_description?: string | null
          verified?: boolean | null
        }
        Update: {
          anonymous?: boolean | null
          contact_method?: string | null
          created_at?: string | null
          finder_id?: string | null
          found_location?: unknown | null
          id?: string
          reward_claimed?: boolean | null
          stolen_report_id?: string | null
          tip_description?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "found_tips_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "found_tips_stolen_report_id_fkey"
            columns: ["stolen_report_id"]
            isOneToOne: false
            referencedRelation: "stolen_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          condition_rating: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          device_id: string | null
          featured: boolean | null
          id: string
          negotiable: boolean | null
          price: number
          seller_id: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at: string | null
          view_count: number | null
          warranty_remaining_months: number | null
        }
        Insert: {
          condition_rating?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          device_id?: string | null
          featured?: boolean | null
          id?: string
          negotiable?: boolean | null
          price: number
          seller_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          warranty_remaining_months?: number | null
        }
        Update: {
          condition_rating?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          device_id?: string | null
          featured?: boolean | null
          id?: string
          negotiable?: boolean | null
          price?: number
          seller_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          warranty_remaining_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_history: {
        Row: {
          blockchain_hash: string | null
          device_id: string | null
          id: string
          new_owner_id: string | null
          previous_owner_id: string | null
          transfer_date: string | null
          transfer_type: string | null
          verified: boolean | null
        }
        Insert: {
          blockchain_hash?: string | null
          device_id?: string | null
          id?: string
          new_owner_id?: string | null
          previous_owner_id?: string | null
          transfer_date?: string | null
          transfer_type?: string | null
          verified?: boolean | null
        }
        Update: {
          blockchain_hash?: string | null
          device_id?: string | null
          id?: string
          new_owner_id?: string | null
          previous_owner_id?: string | null
          transfer_date?: string | null
          transfer_type?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ownership_history_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_history_new_owner_id_fkey"
            columns: ["new_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_history_previous_owner_id_fkey"
            columns: ["previous_owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_history: {
        Row: {
          cost: number | null
          created_at: string | null
          device_id: string | null
          id: string
          issue_description: string
          repair_date: string | null
          repair_description: string | null
          repair_shop_id: string | null
          verified: boolean | null
          warranty_period_days: number | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          issue_description: string
          repair_date?: string | null
          repair_description?: string | null
          repair_shop_id?: string | null
          verified?: boolean | null
          warranty_period_days?: number | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          issue_description?: string
          repair_date?: string | null
          repair_description?: string | null
          repair_shop_id?: string | null
          verified?: boolean | null
          warranty_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "repair_history_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_history_repair_shop_id_fkey"
            columns: ["repair_shop_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stolen_reports: {
        Row: {
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          incident_date: string | null
          incident_location: unknown | null
          police_report_number: string | null
          report_type: string
          reporter_id: string | null
          reward_amount: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          incident_date?: string | null
          incident_location?: unknown | null
          police_report_number?: string | null
          report_type: string
          reporter_id?: string | null
          reward_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          incident_date?: string | null
          incident_location?: unknown | null
          police_report_number?: string | null
          report_type?: string
          reporter_id?: string | null
          reward_amount?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stolen_reports_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stolen_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          blockchain_hash: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          from_wallet_id: string | null
          id: string
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          to_wallet_id: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          blockchain_hash?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          from_wallet_id?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_wallet_id?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          blockchain_hash?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          from_wallet_id?: string | null
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          to_wallet_id?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          verification_status: boolean | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verification_status?: boolean | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verification_status?: boolean | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
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
      device_status: "active" | "stolen" | "lost" | "recovered" | "sold"
      escrow_status:
        | "created"
        | "funded"
        | "released"
        | "disputed"
        | "cancelled"
      listing_status: "active" | "sold" | "removed" | "flagged"
      transaction_status:
        | "pending"
        | "completed"
        | "failed"
        | "disputed"
        | "refunded"
      user_role:
        | "individual"
        | "retailer"
        | "repair_shop"
        | "law_enforcement"
        | "ngo"
        | "insurance"
        | "admin"
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
      device_status: ["active", "stolen", "lost", "recovered", "sold"],
      escrow_status: ["created", "funded", "released", "disputed", "cancelled"],
      listing_status: ["active", "sold", "removed", "flagged"],
      transaction_status: [
        "pending",
        "completed",
        "failed",
        "disputed",
        "refunded",
      ],
      user_role: [
        "individual",
        "retailer",
        "repair_shop",
        "law_enforcement",
        "ngo",
        "insurance",
        "admin",
      ],
    },
  },
} as const
