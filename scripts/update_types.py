import re

# New table definitions to add
new_tables = """
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
"""

# Additional columns for devices table
new_device_columns_row = """
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
"""

new_device_columns_insert = """
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
"""

with open('src/integrations/supabase/types.ts', 'r') as f:
    content = f.read()

# Insert new tables
# Find the start of Tables object and insert new tables
content = content.replace('Tables: {', 'Tables: {' + new_tables, 1)

# Add columns to devices table
# This is tricky with regex, doing simple replacement based on a known existing column
content = content.replace('blockchain_hash: string | null', 'blockchain_hash: string | null' + new_device_columns_row, 1)
content = content.replace('blockchain_hash?: string | null', 'blockchain_hash?: string | null' + new_device_columns_insert, 1)
# Update needs to be handled too
content = content.replace('blockchain_hash?: string | null', 'blockchain_hash?: string | null' + new_device_columns_insert, 1)

with open('src/integrations/supabase/types.ts', 'w') as f:
    f.write(content)

print("Successfully updated types.ts")
