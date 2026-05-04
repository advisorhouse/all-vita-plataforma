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
      access_logs: {
        Row: {
          action: string
          created_at: string
          device: string | null
          id: string
          ip: string | null
          location: string | null
          metadata: Json | null
          module: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          location?: string | null
          metadata?: Json | null
          module?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          device?: string | null
          id?: string
          ip?: string | null
          location?: string | null
          metadata?: Json | null
          module?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
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
      ai_personas: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string
          id: string
          knowledge_base: string | null
          name: string
          system_prompt: string | null
          tenant_id: string
          tone_of_voice: string | null
          updated_at: string
          use_emojis: boolean | null
          voice_id: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          knowledge_base?: string | null
          name?: string
          system_prompt?: string | null
          tenant_id: string
          tone_of_voice?: string | null
          updated_at?: string
          use_emojis?: boolean | null
          voice_id?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          knowledge_base?: string | null
          name?: string
          system_prompt?: string | null
          tenant_id?: string
          tone_of_voice?: string | null
          updated_at?: string
          use_emojis?: boolean | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_personas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          data: Json
          expires_at: string | null
          id: string
          prediction_type: string
          tenant_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data: Json
          expires_at?: string | null
          id?: string
          prediction_type: string
          tenant_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data?: Json
          expires_at?: string | null
          id?: string
          prediction_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_tenant_id_fkey"
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
          actor_type: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: string | null
          new_data: Json | null
          old_data: Json | null
          resource: string | null
          resource_id: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_type?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          new_data?: Json | null
          old_data?: Json | null
          resource?: string | null
          resource_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_type?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          new_data?: Json | null
          old_data?: Json | null
          resource?: string | null
          resource_id?: string | null
          tenant_id?: string | null
          user_agent?: string | null
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
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          partner_id: string | null
          tenant_id: string
          updated_at: string | null
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          partner_id?: string | null
          tenant_id: string
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          partner_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
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
          min_months: number | null
          name: string | null
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
          min_months?: number | null
          name?: string | null
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
          min_months?: number | null
          name?: string | null
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
      commissions: {
        Row: {
          amount: number
          client_id: string | null
          commission_type: string
          created_at: string
          id: string
          metadata: Json | null
          order_id: string | null
          paid_at: string | null
          paid_by: string | null
          paid_status: string
          partner_id: string
          payment_method: string | null
          payment_notes: string | null
          payment_proof_url: string | null
          percentage_applied: number
          tenant_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          commission_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_status?: string
          partner_id: string
          payment_method?: string | null
          payment_notes?: string | null
          payment_proof_url?: string | null
          percentage_applied?: number
          tenant_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          commission_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          order_id?: string | null
          paid_at?: string | null
          paid_by?: string | null
          paid_status?: string
          partner_id?: string
          payment_method?: string | null
          payment_notes?: string | null
          payment_proof_url?: string | null
          percentage_applied?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          slug: string
          subject: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          slug: string
          subject?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          slug?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
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
      entity_versions: {
        Row: {
          changed_at: string
          changed_by: string | null
          data_snapshot: Json
          entity_id: string
          entity_type: string
          id: string
          version: number
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          data_snapshot?: Json
          entity_id: string
          entity_type: string
          id?: string
          version?: number
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          data_snapshot?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          version?: number
        }
        Relationships: []
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
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          external_id: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          status: string
          subscription_id: string | null
          tenant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tenant_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
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
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
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
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          read: boolean
          tenant_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          tenant_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          all_vita_fee: number | null
          amount: number
          client_id: string
          created_at: string
          currency: string
          external_id: string | null
          id: string
          metadata: Json | null
          payment_status: string
          product_id: string | null
          status: string
          subscription_cycle: number
          tenant_amount: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          all_vita_fee?: number | null
          amount?: number
          client_id: string
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_status?: string
          product_id?: string | null
          status?: string
          subscription_cycle?: number
          tenant_amount?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          all_vita_fee?: number | null
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_status?: string
          product_id?: string | null
          status?: string
          subscription_cycle?: number
          tenant_amount?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      pagarme_webhook_events: {
        Row: {
          created_at: string
          event_id: string | null
          event_type: string
          id: string
          payload: Json
          process_error: string | null
          processed: boolean
          processed_at: string | null
          resource_id: string | null
          resource_type: string | null
          retry_count: number
          signature: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_type: string
          id?: string
          payload?: Json
          process_error?: string | null
          processed?: boolean
          processed_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          retry_count?: number
          signature?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          process_error?: string | null
          processed?: boolean
          processed_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          retry_count?: number
          signature?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          bank_holder_document: string | null
          bank_holder_name: string | null
          created_at: string
          id: string
          level: string | null
          metadata: Json | null
          parent_partner_id: string | null
          pix_key: string | null
          pix_key_type: string | null
          referral_code: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          bank_holder_document?: string | null
          bank_holder_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          metadata?: Json | null
          parent_partner_id?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          referral_code: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          bank_holder_document?: string | null
          bank_holder_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          metadata?: Json | null
          parent_partner_id?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
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
          recipient_id: string | null
          tenant_id: string | null
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
          recipient_id?: string | null
          tenant_id?: string | null
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
          recipient_id?: string | null
          tenant_id?: string | null
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
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          installments: number | null
          order_id: string | null
          pagarme_charge_id: string | null
          pagarme_order_id: string | null
          payment_method: string | null
          raw_request: Json | null
          raw_response: Json | null
          status: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          installments?: number | null
          order_id?: string | null
          pagarme_charge_id?: string | null
          pagarme_order_id?: string | null
          payment_method?: string | null
          raw_request?: Json | null
          raw_response?: Json | null
          status: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          installments?: number | null
          order_id?: string | null
          pagarme_charge_id?: string | null
          pagarme_order_id?: string | null
          payment_method?: string | null
          raw_request?: Json | null
          raw_response?: Json | null
          status?: string
          tenant_id?: string
        }
        Relationships: []
      }
      platform_role_permissions: {
        Row: {
          action: string
          allowed: boolean
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          action: string
          allowed?: boolean
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          action?: string
          allowed?: boolean
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          order: number | null
          product_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          order?: number | null
          product_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          order?: number | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_integrations: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          integration_type: string
          last_sync_at: string | null
          metadata: Json | null
          product_id: string
          sync_status: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          integration_type: string
          last_sync_at?: string | null
          metadata?: Json | null
          product_id: string
          sync_status?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          integration_type?: string
          last_sync_at?: string | null
          metadata?: Json | null
          product_id?: string
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_integrations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          barcodes: Json | null
          billing_type: string | null
          brand: string | null
          category: string | null
          checkout_url: string | null
          created_at: string
          description: string | null
          height_cm: number | null
          id: string
          length_cm: number | null
          max_installments: number | null
          metadata: Json | null
          name: string
          pagarme_last_sync_at: string | null
          pagarme_product_id: string | null
          pagarme_sync_error: string | null
          pagarme_sync_status: string | null
          price: number
          sku: string | null
          stock_quantity: number | null
          subscription_interval: string | null
          subscription_interval_count: number | null
          tenant_id: string
          type: string
          updated_at: string
          weight: number | null
          width_cm: number | null
        }
        Insert: {
          active?: boolean
          barcodes?: Json | null
          billing_type?: string | null
          brand?: string | null
          category?: string | null
          checkout_url?: string | null
          created_at?: string
          description?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          max_installments?: number | null
          metadata?: Json | null
          name: string
          pagarme_last_sync_at?: string | null
          pagarme_product_id?: string | null
          pagarme_sync_error?: string | null
          pagarme_sync_status?: string | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          subscription_interval?: string | null
          subscription_interval_count?: number | null
          tenant_id: string
          type?: string
          updated_at?: string
          weight?: number | null
          width_cm?: number | null
        }
        Update: {
          active?: boolean
          barcodes?: Json | null
          billing_type?: string | null
          brand?: string | null
          category?: string | null
          checkout_url?: string | null
          created_at?: string
          description?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          max_installments?: number | null
          metadata?: Json | null
          name?: string
          pagarme_last_sync_at?: string | null
          pagarme_product_id?: string | null
          pagarme_sync_error?: string | null
          pagarme_sync_status?: string | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          subscription_interval?: string | null
          subscription_interval_count?: number | null
          tenant_id?: string
          type?: string
          updated_at?: string
          weight?: number | null
          width_cm?: number | null
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
          partner_onboarding_seen: boolean
          phone: string | null
          tour_completed: boolean | null
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
          partner_onboarding_seen?: boolean
          phone?: string | null
          tour_completed?: boolean | null
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
          partner_onboarding_seen?: boolean
          phone?: string | null
          tour_completed?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_responses: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          partner_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          partner_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          partner_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "quiz_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      rate_limits: {
        Row: {
          count: number
          expires_at: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          expires_at?: string
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          expires_at?: string
          id?: string
          key?: string
          window_start?: string
        }
        Relationships: []
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
      saas_plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          features: Json
          id: string
          is_recommended: boolean
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number
          transaction_fee_percentage: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_recommended?: boolean
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          transaction_fee_percentage?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_recommended?: boolean
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number
          transaction_fee_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          metadata: Json | null
          severity: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          severity?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          severity?: string | null
          type?: string
          user_id?: string | null
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
      staff_invitations: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          expires_at: string
          full_name: string | null
          id: string
          invited_by: string | null
          opened_at: string | null
          role: string
          sent_at: string | null
          status: string
          token: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          opened_at?: string | null
          role?: string
          sent_at?: string | null
          status?: string
          token?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          invited_by?: string | null
          opened_at?: string | null
          role?: string
          sent_at?: string | null
          status?: string
          token?: string
        }
        Relationships: []
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
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
      tenant_protocol_landing: {
        Row: {
          active: boolean
          created_at: string
          cta_button_label: string | null
          cta_description: string | null
          cta_meta: string | null
          cta_title: string | null
          hero_badge: string | null
          hero_cta_label: string | null
          hero_image_url: string | null
          hero_meta: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          logic_benefits: Json | null
          logic_description: string | null
          logic_eyebrow: string | null
          logic_title: string | null
          quiz_age_options: Json | null
          quiz_age_subtitle: string | null
          quiz_age_title: string | null
          quiz_footer_badges: Json
          quiz_header_subtitle: string
          quiz_header_title: string
          quiz_lastvisit_options: Json | null
          quiz_lastvisit_subtitle: string | null
          quiz_lastvisit_title: string | null
          quiz_question_options: Json
          quiz_question_subtitle: string
          quiz_question_title: string
          quiz_supplements_options: Json | null
          quiz_supplements_subtitle: string | null
          quiz_supplements_title: string | null
          quiz_symptoms_options: Json
          quiz_symptoms_subtitle: string
          quiz_symptoms_title: string
          quiz_uv_options: Json | null
          quiz_uv_subtitle: string | null
          quiz_uv_title: string | null
          reasons: Json | null
          result_cta_label: string | null
          result_cta_url: string | null
          result_disclaimer: string | null
          result_levels: Json | null
          result_product_eyebrow: string | null
          result_product_name: string | null
          result_product_powered_by: string | null
          result_subtitle: string | null
          result_title: string | null
          score_weights: Json | null
          tenant_id: string
          trust_badges: Json | null
          updated_at: string
          why_eyebrow: string | null
          why_paragraph_1: string | null
          why_paragraph_2: string | null
          why_title: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_button_label?: string | null
          cta_description?: string | null
          cta_meta?: string | null
          cta_title?: string | null
          hero_badge?: string | null
          hero_cta_label?: string | null
          hero_image_url?: string | null
          hero_meta?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logic_benefits?: Json | null
          logic_description?: string | null
          logic_eyebrow?: string | null
          logic_title?: string | null
          quiz_age_options?: Json | null
          quiz_age_subtitle?: string | null
          quiz_age_title?: string | null
          quiz_footer_badges?: Json
          quiz_header_subtitle?: string
          quiz_header_title?: string
          quiz_lastvisit_options?: Json | null
          quiz_lastvisit_subtitle?: string | null
          quiz_lastvisit_title?: string | null
          quiz_question_options?: Json
          quiz_question_subtitle?: string
          quiz_question_title?: string
          quiz_supplements_options?: Json | null
          quiz_supplements_subtitle?: string | null
          quiz_supplements_title?: string | null
          quiz_symptoms_options?: Json
          quiz_symptoms_subtitle?: string
          quiz_symptoms_title?: string
          quiz_uv_options?: Json | null
          quiz_uv_subtitle?: string | null
          quiz_uv_title?: string | null
          reasons?: Json | null
          result_cta_label?: string | null
          result_cta_url?: string | null
          result_disclaimer?: string | null
          result_levels?: Json | null
          result_product_eyebrow?: string | null
          result_product_name?: string | null
          result_product_powered_by?: string | null
          result_subtitle?: string | null
          result_title?: string | null
          score_weights?: Json | null
          tenant_id: string
          trust_badges?: Json | null
          updated_at?: string
          why_eyebrow?: string | null
          why_paragraph_1?: string | null
          why_paragraph_2?: string | null
          why_title?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_button_label?: string | null
          cta_description?: string | null
          cta_meta?: string | null
          cta_title?: string | null
          hero_badge?: string | null
          hero_cta_label?: string | null
          hero_image_url?: string | null
          hero_meta?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logic_benefits?: Json | null
          logic_description?: string | null
          logic_eyebrow?: string | null
          logic_title?: string | null
          quiz_age_options?: Json | null
          quiz_age_subtitle?: string | null
          quiz_age_title?: string | null
          quiz_footer_badges?: Json
          quiz_header_subtitle?: string
          quiz_header_title?: string
          quiz_lastvisit_options?: Json | null
          quiz_lastvisit_subtitle?: string | null
          quiz_lastvisit_title?: string | null
          quiz_question_options?: Json
          quiz_question_subtitle?: string
          quiz_question_title?: string
          quiz_supplements_options?: Json | null
          quiz_supplements_subtitle?: string | null
          quiz_supplements_title?: string | null
          quiz_symptoms_options?: Json
          quiz_symptoms_subtitle?: string
          quiz_symptoms_title?: string
          quiz_uv_options?: Json | null
          quiz_uv_subtitle?: string | null
          quiz_uv_title?: string | null
          reasons?: Json | null
          result_cta_label?: string | null
          result_cta_url?: string | null
          result_disclaimer?: string | null
          result_levels?: Json | null
          result_product_eyebrow?: string | null
          result_product_name?: string | null
          result_product_powered_by?: string | null
          result_subtitle?: string | null
          result_title?: string | null
          score_weights?: Json | null
          tenant_id?: string
          trust_badges?: Json | null
          updated_at?: string
          why_eyebrow?: string | null
          why_paragraph_1?: string | null
          why_paragraph_2?: string | null
          why_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_protocol_landing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_role_permissions: {
        Row: {
          action: string
          allowed: boolean
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          action: string
          allowed?: boolean
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          allowed?: boolean
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_segments: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
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
      tenant_subscriptions: {
        Row: {
          billing_cycle: string
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          discount_percent: number | null
          external_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan_id: string
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          discount_percent?: number | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id: string
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          discount_percent?: number | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id?: string
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          activation_email_sent: boolean | null
          active: boolean
          bank_account: string | null
          bank_account_dv: string | null
          bank_account_type: string | null
          bank_agency: string | null
          bank_agency_dv: string | null
          bank_code: string | null
          bank_holder_document: string | null
          bank_holder_name: string | null
          cnpj: string | null
          created_at: string
          custom_transaction_fee: number | null
          dns_records: Json | null
          dns_status: string | null
          dns_verified_at: string | null
          domain: string | null
          email_dns_status: string | null
          favicon_url: string | null
          id: string
          isotipo_url: string | null
          legal_document: string | null
          legal_document_type: string | null
          legal_name: string | null
          logo_url: string | null
          manual_activation_required: boolean | null
          name: string
          pagarme_customer_id: string | null
          pagarme_recipient_created_at: string | null
          pagarme_recipient_status: string | null
          pagarme_recipient_status_reason: string | null
          pending_registration_notification: boolean | null
          primary_color: string | null
          registration_status: string | null
          resend_domain_id: string | null
          secondary_color: string | null
          segment: string | null
          settings: Json | null
          slug: string
          status: string
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          activation_email_sent?: boolean | null
          active?: boolean
          bank_account?: string | null
          bank_account_dv?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_agency_dv?: string | null
          bank_code?: string | null
          bank_holder_document?: string | null
          bank_holder_name?: string | null
          cnpj?: string | null
          created_at?: string
          custom_transaction_fee?: number | null
          dns_records?: Json | null
          dns_status?: string | null
          dns_verified_at?: string | null
          domain?: string | null
          email_dns_status?: string | null
          favicon_url?: string | null
          id?: string
          isotipo_url?: string | null
          legal_document?: string | null
          legal_document_type?: string | null
          legal_name?: string | null
          logo_url?: string | null
          manual_activation_required?: boolean | null
          name: string
          pagarme_customer_id?: string | null
          pagarme_recipient_created_at?: string | null
          pagarme_recipient_status?: string | null
          pagarme_recipient_status_reason?: string | null
          pending_registration_notification?: boolean | null
          primary_color?: string | null
          registration_status?: string | null
          resend_domain_id?: string | null
          secondary_color?: string | null
          segment?: string | null
          settings?: Json | null
          slug: string
          status?: string
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          activation_email_sent?: boolean | null
          active?: boolean
          bank_account?: string | null
          bank_account_dv?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_agency_dv?: string | null
          bank_code?: string | null
          bank_holder_document?: string | null
          bank_holder_name?: string | null
          cnpj?: string | null
          created_at?: string
          custom_transaction_fee?: number | null
          dns_records?: Json | null
          dns_status?: string | null
          dns_verified_at?: string | null
          domain?: string | null
          email_dns_status?: string | null
          favicon_url?: string | null
          id?: string
          isotipo_url?: string | null
          legal_document?: string | null
          legal_document_type?: string | null
          legal_name?: string | null
          logo_url?: string | null
          manual_activation_required?: boolean | null
          name?: string
          pagarme_customer_id?: string | null
          pagarme_recipient_created_at?: string | null
          pagarme_recipient_status?: string | null
          pagarme_recipient_status_reason?: string | null
          pending_registration_notification?: boolean | null
          primary_color?: string | null
          registration_status?: string | null
          resend_domain_id?: string | null
          secondary_color?: string | null
          segment?: string | null
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
      user_security: {
        Row: {
          backup_codes: Json | null
          last_2fa_at: string | null
          two_fa_enabled: boolean
          two_fa_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: Json | null
          last_2fa_at?: string | null
          two_fa_enabled?: boolean
          two_fa_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: Json | null
          last_2fa_at?: string | null
          two_fa_enabled?: boolean
          two_fa_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      vitacoins_wallet: {
        Row: {
          balance: number
          created_at: string
          id: string
          metadata: Json | null
          tenant_id: string
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tenant_id: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitacoins_wallet_tenant_id_fkey"
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
      accept_staff_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      anonymize_user_data: { Args: { _user_id: string }; Returns: undefined }
      attribute_sale: {
        Args: { _order_id: string; _referral_code: string }
        Returns: Json
      }
      belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      can: {
        Args: {
          _action: string
          _resource: string
          _tenant_id?: string
          _user_id: string
        }
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
      check_rate_limit: {
        Args: { _key: string; _max_count?: number; _window_minutes?: number }
        Returns: boolean
      }
      create_audit_log: {
        Args: {
          _action: string
          _actor_type: string
          _entity_id?: string
          _entity_type?: string
          _ip?: string
          _metadata?: Json
          _new_data?: Json
          _old_data?: Json
          _tenant_id: string
          _user_agent?: string
          _user_id: string
        }
        Returns: string
      }
      create_entity_version: {
        Args: {
          _changed_by?: string
          _data_snapshot: Json
          _entity_id: string
          _entity_type: string
        }
        Returns: number
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_tenant_id: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
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
      is_platform_staff: {
        Args: {
          _role?: Database["public"]["Enums"]["staff_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_security_event: {
        Args: {
          _ip?: string
          _metadata?: Json
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      resolve_referral: {
        Args: { _code: string; _tenant_id?: string }
        Returns: {
          active: boolean
          partner_avatar: string
          partner_id: string
          partner_level: string
          partner_name: string
          tenant_id: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "partner"
        | "client"
        | "staff"
      staff_role:
        | "super_admin"
        | "ops"
        | "finance"
        | "support"
        | "growth"
        | "admin"
        | "manager"
        | "staff"
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
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "partner",
        "client",
        "staff",
      ],
      staff_role: [
        "super_admin",
        "ops",
        "finance",
        "support",
        "growth",
        "admin",
        "manager",
        "staff",
      ],
    },
  },
} as const
