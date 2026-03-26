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
      affiliate_campaigns: {
        Row: {
          active: boolean
          affiliate_id: string
          campaign_name: string
          created_at: string
          custom_percentage: number
          end_date: string | null
          id: string
          start_date: string
          total_conversions: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          affiliate_id: string
          campaign_name: string
          created_at?: string
          custom_percentage?: number
          end_date?: string | null
          id?: string
          start_date?: string
          total_conversions?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          affiliate_id?: string
          campaign_name?: string
          created_at?: string
          custom_percentage?: number
          end_date?: string | null
          id?: string
          start_date?: string
          total_conversions?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          unique_token: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          unique_token: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          unique_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "affiliate_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
        ]
      }
      affiliates: {
        Row: {
          active_clients: number
          affiliate_level: string
          affiliate_progress: number
          created_at: string
          doctor_code: string | null
          id: string
          level: Database["public"]["Enums"]["partner_level"]
          recurring_revenue: number
          retention_rate: number
          retention_score: number
          status: string
          total_clients: number
          total_commission_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_clients?: number
          affiliate_level?: string
          affiliate_progress?: number
          created_at?: string
          doctor_code?: string | null
          id?: string
          level?: Database["public"]["Enums"]["partner_level"]
          recurring_revenue?: number
          retention_rate?: number
          retention_score?: number
          status?: string
          total_clients?: number
          total_commission_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_clients?: number
          affiliate_level?: string
          affiliate_progress?: number
          created_at?: string
          doctor_code?: string | null
          id?: string
          level?: Database["public"]["Enums"]["partner_level"]
          recurring_revenue?: number
          retention_rate?: number
          retention_score?: number
          status?: string
          total_clients?: number
          total_commission_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_alerts: {
        Row: {
          actioned: boolean
          alert_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          read: boolean
          severity: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string | null
          title: string
        }
        Insert: {
          actioned?: boolean
          alert_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id?: string | null
          title: string
        }
        Update: {
          actioned?: boolean
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          target_role?: Database["public"]["Enums"]["app_role"]
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      ai_model_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          model_type: string
          model_version: string
          processed_clients: number
          processing_time_ms: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_type: string
          model_version?: string
          processed_clients?: number
          processing_time_ms?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          model_type?: string
          model_version?: string
          processed_clients?: number
          processing_time_ms?: number | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[]
          rate_limit_per_minute: number
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[]
          rate_limit_per_minute?: number
          role?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[]
          rate_limit_per_minute?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      attribution_logs: {
        Row: {
          affiliate_id: string
          attribution_source: string | null
          client_id: string
          created_at: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          attribution_source?: string | null
          client_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          attribution_source?: string | null
          client_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attribution_logs_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_logs_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "attribution_logs_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "attribution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "attribution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "attribution_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      client_activation: {
        Row: {
          activated_at: string
          activation_completed: boolean
          activation_score: number
          badge_first_week: boolean
          content_consumed: number
          created_at: string
          day_counter: number
          days_marked: number[]
          early_risk_flag: boolean
          id: string
          last_login_at: string | null
          logins_count: number
          updated_at: string
          user_id: string
          welcome_modal_seen: boolean
        }
        Insert: {
          activated_at?: string
          activation_completed?: boolean
          activation_score?: number
          badge_first_week?: boolean
          content_consumed?: number
          created_at?: string
          day_counter?: number
          days_marked?: number[]
          early_risk_flag?: boolean
          id?: string
          last_login_at?: string | null
          logins_count?: number
          updated_at?: string
          user_id: string
          welcome_modal_seen?: boolean
        }
        Update: {
          activated_at?: string
          activation_completed?: boolean
          activation_score?: number
          badge_first_week?: boolean
          content_consumed?: number
          created_at?: string
          day_counter?: number
          days_marked?: number[]
          early_risk_flag?: boolean
          id?: string
          last_login_at?: string | null
          logins_count?: number
          updated_at?: string
          user_id?: string
          welcome_modal_seen?: boolean
        }
        Relationships: []
      }
      client_benefits: {
        Row: {
          benefit_id: string
          client_id: string
          id: string
          redeemed: boolean
          unlocked_at: string
        }
        Insert: {
          benefit_id: string
          client_id: string
          id?: string
          redeemed?: boolean
          unlocked_at?: string
        }
        Update: {
          benefit_id?: string
          client_id?: string
          id?: string
          redeemed?: boolean
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "gamification_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_benefits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_benefits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_benefits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_benefits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      client_challenge_progress: {
        Row: {
          challenge_id: string
          client_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          usage_days: number
        }
        Insert: {
          challenge_id: string
          client_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          usage_days?: number
        }
        Update: {
          challenge_id?: string
          client_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          usage_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "monthly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_challenge_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_challenge_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_challenge_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_challenge_progress_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      client_profiles: {
        Row: {
          affiliate_id: string | null
          affiliate_locked: boolean
          age_segment: string | null
          behavioral_score: number | null
          birth_date: string | null
          churn_probability: number | null
          consistency_score: number | null
          cpf_encrypted: string
          cpf_hash: string
          created_at: string
          engagement_score: number | null
          id: string
          level: string
          level_progress: number
          ltv_prediction: number | null
          risk_level: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_id?: string | null
          affiliate_locked?: boolean
          age_segment?: string | null
          behavioral_score?: number | null
          birth_date?: string | null
          churn_probability?: number | null
          consistency_score?: number | null
          cpf_encrypted: string
          cpf_hash: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          level?: string
          level_progress?: number
          ltv_prediction?: number | null
          risk_level?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string | null
          affiliate_locked?: boolean
          age_segment?: string | null
          behavioral_score?: number | null
          birth_date?: string | null
          churn_probability?: number | null
          consistency_score?: number | null
          cpf_encrypted?: string
          cpf_hash?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          level?: string
          level_progress?: number
          ltv_prediction?: number | null
          risk_level?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_usage_logs: {
        Row: {
          client_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          client_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          client_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "client_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "client_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      commission_audit_log: {
        Row: {
          affiliate_id: string
          client_id: string
          commission_amount: number
          commission_id: string | null
          commission_type: string
          created_at: string
          cumulative_total: number
          fixed_bonus: number
          id: string
          margin_check_passed: boolean
          margin_percentage: number | null
          order_amount: number
          order_id: string
          percentage_applied: number
          reason: string
          rule_id: string | null
          rule_name: string
          simulation_base: Json | null
          was_stacked: boolean
        }
        Insert: {
          affiliate_id: string
          client_id: string
          commission_amount: number
          commission_id?: string | null
          commission_type: string
          created_at?: string
          cumulative_total?: number
          fixed_bonus?: number
          id?: string
          margin_check_passed?: boolean
          margin_percentage?: number | null
          order_amount: number
          order_id: string
          percentage_applied: number
          reason: string
          rule_id?: string | null
          rule_name: string
          simulation_base?: Json | null
          was_stacked?: boolean
        }
        Update: {
          affiliate_id?: string
          client_id?: string
          commission_amount?: number
          commission_id?: string | null
          commission_type?: string
          created_at?: string
          cumulative_total?: number
          fixed_bonus?: number
          id?: string
          margin_check_passed?: boolean
          margin_percentage?: number | null
          order_amount?: number
          order_id?: string
          percentage_applied?: number
          reason?: string
          rule_id?: string | null
          rule_name?: string
          simulation_base?: Json | null
          was_stacked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "commission_audit_log_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_audit_log_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "fact_commissions"
            referencedColumns: ["commission_key"]
          },
        ]
      }
      commission_rules: {
        Row: {
          active: boolean
          affiliate_level_required: string | null
          age_segment: string | null
          allow_stack: boolean
          campaign_id: string | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          description: string | null
          fixed_bonus_value: number | null
          id: string
          level: Database["public"]["Enums"]["partner_level"]
          max_active_months: number | null
          max_commission_per_client: number | null
          min_months: number
          percentage: number
          priority_order: number
          product_id: string | null
          rule_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          affiliate_level_required?: string | null
          age_segment?: string | null
          allow_stack?: boolean
          campaign_id?: string | null
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          description?: string | null
          fixed_bonus_value?: number | null
          id?: string
          level: Database["public"]["Enums"]["partner_level"]
          max_active_months?: number | null
          max_commission_per_client?: number | null
          min_months?: number
          percentage: number
          priority_order?: number
          product_id?: string | null
          rule_name?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          affiliate_level_required?: string | null
          age_segment?: string | null
          allow_stack?: boolean
          campaign_id?: string | null
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          description?: string | null
          fixed_bonus_value?: number | null
          id?: string
          level?: Database["public"]["Enums"]["partner_level"]
          max_active_months?: number | null
          max_commission_per_client?: number | null
          min_months?: number
          percentage?: number
          priority_order?: number
          product_id?: string | null
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          client_id: string
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          id: string
          order_id: string
          paid_status: Database["public"]["Enums"]["payment_status"]
          percentage_applied: number
        }
        Insert: {
          affiliate_id: string
          amount: number
          client_id: string
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          id?: string
          order_id: string
          paid_status?: Database["public"]["Enums"]["payment_status"]
          percentage_applied: number
        }
        Update: {
          affiliate_id?: string
          amount?: number
          client_id?: string
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          id?: string
          order_id?: string
          paid_status?: Database["public"]["Enums"]["payment_status"]
          percentage_applied?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "fact_revenue"
            referencedColumns: ["order_key"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          affiliate_id: string | null
          client_id: string | null
          created_at: string
          id: string
          reason: string
          resolved: boolean
          risk_level: Database["public"]["Enums"]["fraud_risk_level"]
        }
        Insert: {
          affiliate_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          reason: string
          resolved?: boolean
          risk_level?: Database["public"]["Enums"]["fraud_risk_level"]
        }
        Update: {
          affiliate_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          resolved?: boolean
          risk_level?: Database["public"]["Enums"]["fraud_risk_level"]
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "fraud_alerts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "fraud_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "fraud_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "fraud_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      gamification_benefits: {
        Row: {
          active: boolean
          benefit_type: string
          created_at: string
          description: string
          id: string
          required_months: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefit_type?: string
          created_at?: string
          description: string
          id?: string
          required_months: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefit_type?: string
          created_at?: string
          description?: string
          id?: string
          required_months?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      margin_protection_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          margin_alert_threshold: number
          margin_block_threshold: number
          max_commission_per_client: number | null
          max_commission_percentage: number
          rule_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          margin_alert_threshold?: number
          margin_block_threshold?: number
          max_commission_per_client?: number | null
          max_commission_percentage?: number
          rule_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          margin_alert_threshold?: number
          margin_block_threshold?: number
          max_commission_per_client?: number | null
          max_commission_percentage?: number
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_challenges: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          month: number
          required_usage_days: number
          reward_consistency_bonus: number
          reward_description: string
          title: string
          year: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          id?: string
          month: number
          required_usage_days?: number
          reward_consistency_bonus?: number
          reward_description: string
          title: string
          year: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          month?: number
          required_usage_days?: number
          reward_consistency_bonus?: number
          reward_description?: string
          title?: string
          year?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: string
          subscription_cycle: number
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: string
          subscription_cycle?: number
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: string
          subscription_cycle?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
      partner_products: {
        Row: {
          active: boolean
          created_at: string
          custom_points_per_sale: number | null
          exclusive: boolean
          id: string
          partner_id: string
          product_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          custom_points_per_sale?: number | null
          exclusive?: boolean
          id?: string
          partner_id: string
          product_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          custom_points_per_sale?: number | null
          exclusive?: boolean
          id?: string
          partner_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "partner_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "partner_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          discount_percentage: number
          discounted_price: number | null
          id: string
          image_url: string | null
          name: string
          points_per_sale: number
          short_description: string | null
          subscription_months: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          name: string
          points_per_sale?: number
          short_description?: string | null
          subscription_months?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          name?: string
          points_per_sale?: number
          short_description?: string | null
          subscription_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          affiliate_id: string | null
          age: number | null
          consent_contact_email: boolean | null
          consent_contact_phone: boolean | null
          consent_contact_sms: boolean | null
          consent_contact_social: boolean | null
          consent_contact_whatsapp: boolean | null
          consent_data_usage: boolean | null
          consultation_reason: string | null
          continuous_medications: boolean | null
          converted_to_client: boolean | null
          cpf: string
          created_at: string
          doctor_code: string
          email: string
          eye_drops_detail: string | null
          full_name: string
          had_eye_surgery: boolean | null
          had_eye_trauma: boolean | null
          health_conditions: string[] | null
          id: string
          medications_detail: string | null
          other_conditions: string | null
          other_reason: string | null
          phone: string
          product_id: string | null
          sex: string | null
          status: string
          surgery_detail: string | null
          updated_at: string
          uses_eye_drops: boolean | null
        }
        Insert: {
          affiliate_id?: string | null
          age?: number | null
          consent_contact_email?: boolean | null
          consent_contact_phone?: boolean | null
          consent_contact_sms?: boolean | null
          consent_contact_social?: boolean | null
          consent_contact_whatsapp?: boolean | null
          consent_data_usage?: boolean | null
          consultation_reason?: string | null
          continuous_medications?: boolean | null
          converted_to_client?: boolean | null
          cpf: string
          created_at?: string
          doctor_code: string
          email: string
          eye_drops_detail?: string | null
          full_name: string
          had_eye_surgery?: boolean | null
          had_eye_trauma?: boolean | null
          health_conditions?: string[] | null
          id?: string
          medications_detail?: string | null
          other_conditions?: string | null
          other_reason?: string | null
          phone: string
          product_id?: string | null
          sex?: string | null
          status?: string
          surgery_detail?: string | null
          updated_at?: string
          uses_eye_drops?: boolean | null
        }
        Update: {
          affiliate_id?: string | null
          age?: number | null
          consent_contact_email?: boolean | null
          consent_contact_phone?: boolean | null
          consent_contact_sms?: boolean | null
          consent_contact_social?: boolean | null
          consent_contact_whatsapp?: boolean | null
          consent_data_usage?: boolean | null
          consultation_reason?: string | null
          continuous_medications?: boolean | null
          converted_to_client?: boolean | null
          cpf?: string
          created_at?: string
          doctor_code?: string
          email?: string
          eye_drops_detail?: string | null
          full_name?: string
          had_eye_surgery?: boolean | null
          had_eye_trauma?: boolean | null
          health_conditions?: string[] | null
          id?: string
          medications_detail?: string | null
          other_conditions?: string | null
          other_reason?: string | null
          phone?: string
          product_id?: string | null
          sex?: string | null
          status?: string
          surgery_detail?: string | null
          updated_at?: string
          uses_eye_drops?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_submissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "quiz_submissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "quiz_submissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      report_access_logs: {
        Row: {
          created_at: string
          id: string
          parameters: Json | null
          report_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parameters?: Json | null
          report_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parameters?: Json | null
          report_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          response_body: string | null
          response_status: number | null
          retry_count: number
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number
          source: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number
          source?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      dim_affiliate: {
        Row: {
          active_clients: number | null
          affiliate_key: string | null
          affiliate_level: string | null
          created_at: string | null
          level: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue: number | null
          retention_rate: number | null
          retention_score: number | null
          status: string | null
          total_clients: number | null
          total_commission_paid: number | null
          user_id: string | null
        }
        Insert: {
          active_clients?: number | null
          affiliate_key?: string | null
          affiliate_level?: string | null
          created_at?: string | null
          level?: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue?: number | null
          retention_rate?: number | null
          retention_score?: number | null
          status?: string | null
          total_clients?: number | null
          total_commission_paid?: number | null
          user_id?: string | null
        }
        Update: {
          active_clients?: number | null
          affiliate_key?: string | null
          affiliate_level?: string | null
          created_at?: string | null
          level?: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue?: number | null
          retention_rate?: number | null
          retention_score?: number | null
          status?: string | null
          total_clients?: number | null
          total_commission_paid?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      dim_client: {
        Row: {
          acquisition_cohort: string | null
          acquisition_date: string | null
          affiliate_id: string | null
          age_segment: string | null
          behavioral_score: number | null
          churn_probability: number | null
          client_key: string | null
          consistency_score: number | null
          engagement_score: number | null
          level: string | null
          ltv_prediction: number | null
          months_active: number | null
          risk_level: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id: string | null
        }
        Insert: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          behavioral_score?: number | null
          churn_probability?: number | null
          client_key?: string | null
          consistency_score?: number | null
          engagement_score?: number | null
          level?: string | null
          ltv_prediction?: number | null
          months_active?: never
          risk_level?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id?: string | null
        }
        Update: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          behavioral_score?: number | null
          churn_probability?: number | null
          client_key?: string | null
          consistency_score?: number | null
          engagement_score?: number | null
          level?: string | null
          ltv_prediction?: number | null
          months_active?: never
          risk_level?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id?: string | null
        }
        Relationships: []
      }
      dim_time: {
        Row: {
          date_key: string | null
          day_of_week: number | null
          month: number | null
          month_label: string | null
          year: number | null
          year_month: string | null
        }
        Relationships: []
      }
      fact_affiliate_performance: {
        Row: {
          active_clients: number | null
          affiliate_key: string | null
          affiliate_level: string | null
          client_retention_pct: number | null
          created_at: string | null
          level: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue: number | null
          retention_rate: number | null
          retention_score: number | null
          revenue_per_client: number | null
          status: string | null
          total_clients: number | null
          total_commission_paid: number | null
        }
        Insert: {
          active_clients?: number | null
          affiliate_key?: string | null
          affiliate_level?: string | null
          client_retention_pct?: never
          created_at?: string | null
          level?: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue?: number | null
          retention_rate?: number | null
          retention_score?: number | null
          revenue_per_client?: never
          status?: string | null
          total_clients?: number | null
          total_commission_paid?: number | null
        }
        Update: {
          active_clients?: number | null
          affiliate_key?: string | null
          affiliate_level?: string | null
          client_retention_pct?: never
          created_at?: string | null
          level?: Database["public"]["Enums"]["partner_level"] | null
          recurring_revenue?: number | null
          retention_rate?: number | null
          retention_score?: number | null
          revenue_per_client?: never
          status?: string | null
          total_clients?: number | null
          total_commission_paid?: number | null
        }
        Relationships: []
      }
      fact_churn: {
        Row: {
          acquisition_cohort: string | null
          acquisition_date: string | null
          affiliate_id: string | null
          age_segment: string | null
          churn_probability: number | null
          client_key: string | null
          level: string | null
          months_before_churn: number | null
          risk_level: string | null
          status_change_date: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
        }
        Insert: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          churn_probability?: number | null
          client_key?: string | null
          level?: string | null
          months_before_churn?: never
          risk_level?: string | null
          status_change_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
        }
        Update: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          churn_probability?: number | null
          client_key?: string | null
          level?: string | null
          months_before_churn?: never
          risk_level?: string | null
          status_change_date?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
        }
        Relationships: []
      }
      fact_commissions: {
        Row: {
          affiliate_id: string | null
          affiliate_level: string | null
          age_segment: string | null
          amount: number | null
          client_id: string | null
          client_level: string | null
          commission_key: string | null
          commission_month: string | null
          commission_type: Database["public"]["Enums"]["commission_type"] | null
          created_at: string | null
          order_id: string | null
          paid_status: Database["public"]["Enums"]["payment_status"] | null
          percentage_applied: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "dim_affiliate"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "fact_affiliate_performance"
            referencedColumns: ["affiliate_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "fact_revenue"
            referencedColumns: ["order_key"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_retention: {
        Row: {
          acquisition_cohort: string | null
          acquisition_date: string | null
          affiliate_id: string | null
          age_segment: string | null
          client_key: string | null
          consistency_score: number | null
          engagement_score: number | null
          is_retained: boolean | null
          level: string | null
          ltv_prediction: number | null
          months_active: number | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id: string | null
        }
        Insert: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          client_key?: string | null
          consistency_score?: number | null
          engagement_score?: number | null
          is_retained?: never
          level?: string | null
          ltv_prediction?: number | null
          months_active?: never
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id?: string | null
        }
        Update: {
          acquisition_cohort?: never
          acquisition_date?: string | null
          affiliate_id?: string | null
          age_segment?: string | null
          client_key?: string | null
          consistency_score?: number | null
          engagement_score?: number | null
          is_retained?: never
          level?: string | null
          ltv_prediction?: number | null
          months_active?: never
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          user_id?: string | null
        }
        Relationships: []
      }
      fact_revenue: {
        Row: {
          affiliate_id: string | null
          age_segment: string | null
          amount: number | null
          client_id: string | null
          client_level: string | null
          created_at: string | null
          order_key: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          revenue_month: string | null
          subscription_cycle: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "dim_client"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_churn"
            referencedColumns: ["client_key"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "fact_retention"
            referencedColumns: ["client_key"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_affiliate_clients: {
        Args: { aff_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "client" | "affiliate" | "admin"
      client_level:
        | "inicio"
        | "consistencia"
        | "protecao_ativa"
        | "longevidade"
        | "elite_vision"
      commission_type: "initial" | "recurring" | "bonus_6m" | "bonus_12m"
      fraud_risk_level: "low" | "medium" | "high" | "critical"
      partner_level: "basic" | "premium" | "elite"
      payment_status: "paid" | "pending" | "failed" | "refunded"
      subscription_status: "active" | "paused" | "cancelled" | "pending"
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
      app_role: ["client", "affiliate", "admin"],
      client_level: [
        "inicio",
        "consistencia",
        "protecao_ativa",
        "longevidade",
        "elite_vision",
      ],
      commission_type: ["initial", "recurring", "bonus_6m", "bonus_12m"],
      fraud_risk_level: ["low", "medium", "high", "critical"],
      partner_level: ["basic", "premium", "elite"],
      payment_status: ["paid", "pending", "failed", "refunded"],
      subscription_status: ["active", "paused", "cancelled", "pending"],
    },
  },
} as const
