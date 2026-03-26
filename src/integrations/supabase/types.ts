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
      affiliate_links: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          metadata: Json | null
          partner_id: string
          tenant_id: string
          url: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id: string
          tenant_id: string
          url?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id?: string
          tenant_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      all_vita_staff: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          name: string
          tenant_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          tenant_id: string
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          tenant_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip: string | null
          resource: string | null
          resource_id: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          resource?: string | null
          resource_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip?: string | null
          resource?: string | null
          resource_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clicks: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          link_id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          link_id: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          link_id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          metadata: Json | null
          phone: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level: number
          metadata: Json | null
          percentage: number
          tenant_id: string
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level?: number
          metadata?: Json | null
          percentage?: number
          tenant_id: string
          type?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level?: number
          metadata?: Json | null
          percentage?: number
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_to_coin_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level: number
          metadata: Json | null
          multiplier: number
          percentage: number
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level?: number
          metadata?: Json | null
          multiplier?: number
          percentage?: number
          tenant_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level?: number
          metadata?: Json | null
          multiplier?: number
          percentage?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_to_coin_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          body: string | null
          content_type: string | null
          created_at: string
          id: string
          metadata: Json | null
          published: boolean
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published?: boolean
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published?: boolean
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          attributed_at: string
          created_at: string
          id: string
          link_id: string | null
          metadata: Json | null
          partner_id: string
          tenant_id: string
          transaction_id: string
        }
        Insert: {
          attributed_at?: string
          created_at?: string
          id?: string
          link_id?: string | null
          metadata?: Json | null
          partner_id: string
          tenant_id: string
          transaction_id: string
        }
        Update: {
          attributed_at?: string
          created_at?: string
          id?: string
          link_id?: string | null
          metadata?: Json | null
          partner_id?: string
          tenant_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          published: boolean
          sort_order: number
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          published?: boolean
          sort_order?: number
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          published?: boolean
          sort_order?: number
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification: {
        Row: {
          id: string
          level: string | null
          metadata: Json | null
          points: number
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          level?: string | null
          metadata?: Json | null
          points?: number
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          level?: string | null
          metadata?: Json | null
          points?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          active: boolean
          config: Json | null
          created_at: string
          id: string
          name: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          config?: Json | null
          created_at?: string
          id?: string
          name: string
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body: string | null
          course_id: string
          created_at: string
          id: string
          metadata: Json | null
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          body?: string | null
          course_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          body?: string | null
          course_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          benefits: Json | null
          created_at: string
          id: string
          min_points: number
          name: string
          requirements: Json | null
          sort_order: number
          tenant_id: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          id?: string
          min_points?: number
          name: string
          requirements?: Json | null
          sort_order?: number
          tenant_id: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          id?: string
          min_points?: number
          name?: string
          requirements?: Json | null
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          active: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mt_commissions: {
        Row: {
          amount: number
          created_at: string
          id: string
          level: number | null
          metadata: Json | null
          partner_id: string
          source: string | null
          source_id: string | null
          source_type: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          level?: number | null
          metadata?: Json | null
          partner_id: string
          source?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          level?: number | null
          metadata?: Json | null
          partner_id?: string
          source?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mt_commissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level: string | null
          metadata: Json | null
          parent_partner_id: string | null
          referral_code: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level?: string | null
          metadata?: Json | null
          parent_partner_id?: string | null
          referral_code: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level?: string | null
          metadata?: Json | null
          parent_partner_id?: string | null
          referral_code?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_parent_partner_id_fkey"
            columns: ["parent_partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_integrations: {
        Row: {
          active: boolean
          api_key_encrypted: string | null
          created_at: string
          id: string
          metadata: Json | null
          provider: string
          tenant_id: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          active?: boolean
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider: string
          tenant_id: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          active?: boolean
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider?: string
          tenant_id?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price: number
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price?: number
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: number
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf_encrypted: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          must_change_password: boolean
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf_encrypted?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          must_change_password?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf_encrypted?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          must_change_password?: boolean
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_submissions: {
        Row: {
          age: number | null
          consent_contact_email: boolean | null
          consent_contact_phone: boolean | null
          consent_contact_sms: boolean | null
          consent_contact_social: boolean | null
          consent_contact_whatsapp: boolean | null
          consent_data_usage: boolean | null
          consultation_reason: string | null
          continuous_medications: boolean | null
          cpf: string
          created_at: string | null
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
          sex: string | null
          surgery_detail: string | null
          tenant_id: string | null
          uses_eye_drops: boolean | null
        }
        Insert: {
          age?: number | null
          consent_contact_email?: boolean | null
          consent_contact_phone?: boolean | null
          consent_contact_sms?: boolean | null
          consent_contact_social?: boolean | null
          consent_contact_whatsapp?: boolean | null
          consent_data_usage?: boolean | null
          consultation_reason?: string | null
          continuous_medications?: boolean | null
          cpf: string
          created_at?: string | null
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
          sex?: string | null
          surgery_detail?: string | null
          tenant_id?: string | null
          uses_eye_drops?: boolean | null
        }
        Update: {
          age?: number | null
          consent_contact_email?: boolean | null
          consent_contact_phone?: boolean | null
          consent_contact_sms?: boolean | null
          consent_contact_social?: boolean | null
          consent_contact_whatsapp?: boolean | null
          consent_data_usage?: boolean | null
          consultation_reason?: string | null
          continuous_medications?: boolean | null
          cpf?: string
          created_at?: string | null
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
          sex?: string | null
          surgery_detail?: string | null
          tenant_id?: string | null
          uses_eye_drops?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          id: string
          metadata: Json | null
          period: string
          position: number | null
          score: number
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          period?: string
          position?: number | null
          score?: number
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          period?: string
          position?: number | null
          score?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_requests: {
        Row: {
          amount: number
          catalog_item_id: string | null
          created_at: string
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tenant_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_catalog_fk"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          attribution_type: string | null
          client_id: string
          created_at: string
          id: string
          partner_id: string
          source_link_id: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          attribution_type?: string | null
          client_id: string
          created_at?: string
          id?: string
          partner_id: string
          source_link_id?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          attribution_type?: string | null
          client_id?: string
          created_at?: string
          id?: string
          partner_id?: string
          source_link_id?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_source_link_id_fkey"
            columns: ["source_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          points_required: number
          tenant_id: string
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          points_required?: number
          tenant_id: string
          type?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          points_required?: number
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_catalog: {
        Row: {
          active: boolean
          cost_in_coins: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          stock: number | null
          tenant_id: string
          type: string
        }
        Insert: {
          active?: boolean
          cost_in_coins: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          stock?: number | null
          tenant_id: string
          type?: string
        }
        Update: {
          active?: boolean
          cost_in_coins?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          stock?: number | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          allowed: boolean
          conditions: Json | null
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          action: string
          allowed?: boolean
          conditions?: Json | null
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          action?: string
          allowed?: boolean
          conditions?: Json | null
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      staff: {
        Row: {
          active: boolean
          created_at: string
          id: string
          permissions: Json | null
          role: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          client_id: string
          created_at: string
          id: string
          metadata: Json | null
          product_id: string
          renewal_date: string | null
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          client_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          client_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          product_id?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_addresses: {
        Row: {
          cep: string | null
          city: string | null
          complement: string | null
          country: string
          created_at: string
          district: string | null
          id: string
          number: string | null
          state: string | null
          street: string | null
          tenant_id: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          country?: string
          created_at?: string
          district?: string | null
          id?: string
          number?: string | null
          state?: string | null
          street?: string | null
          tenant_id: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          country?: string
          created_at?: string
          district?: string | null
          id?: string
          number?: string | null
          state?: string | null
          street?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_owners: {
        Row: {
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          rg: string | null
          role: string
          tenant_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          rg?: string | null
          role?: string
          tenant_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          rg?: string | null
          role?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_owners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_staff: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_staff_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean
          cnpj: string | null
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          status: string
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cnpj?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          status?: string
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cnpj?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          status?: string
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          external_id: string | null
          id: string
          integration_id: string | null
          product_id: string | null
          raw_data: Json | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          external_id?: string | null
          id?: string
          integration_id?: string | null
          product_id?: string | null
          raw_data?: Json | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          external_id?: string | null
          id?: string
          integration_id?: string | null
          product_id?: string | null
          raw_data?: Json | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "payment_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          accepted_at: string
          id: string
          ip: string | null
          type: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          ip?: string | null
          type: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          ip?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          id: string
          level_id: string | null
          metadata: Json | null
          points: number
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          level_id?: string | null
          metadata?: Json | null
          points?: number
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          level_id?: string | null
          metadata?: Json | null
          points?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vitacoin_settings: {
        Row: {
          conversion_rate: number
          id: string
          max_redemption_daily: number | null
          metadata: Json | null
          min_redemption: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          conversion_rate?: number
          id?: string
          max_redemption_daily?: number | null
          metadata?: Json | null
          min_redemption?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          conversion_rate?: number
          id?: string
          max_redemption_daily?: number | null
          metadata?: Json | null
          min_redemption?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitacoin_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vitacoin_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          source: string
          tenant_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source?: string
          tenant_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source?: string
          tenant_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitacoin_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet: {
        Row: {
          balance: number
          id: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_tenant_id_fkey"
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
      belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      check_permission: {
        Args: {
          _action: string
          _resource: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      get_partner_id: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tenant_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_in_partner_downline: {
        Args: { _child_partner_id: string; _parent_partner_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "partner" | "client"
      staff_role: "super_admin" | "ops" | "finance" | "support" | "growth"
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
      app_role: ["super_admin", "admin", "manager", "partner", "client"],
      staff_role: ["super_admin", "ops", "finance", "support", "growth"],
    },
  },
} as const
