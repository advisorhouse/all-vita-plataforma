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
          metadata: Json | null
          partner_id: string
          source_id: string | null
          source_type: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id: string
          source_id?: string | null
          source_type?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          partner_id?: string
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
      referrals: {
        Row: {
          client_id: string
          created_at: string
          id: string
          partner_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          partner_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          partner_id?: string
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
            foreignKeyName: "referrals_tenant_id_fkey"
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
      tenants: {
        Row: {
          active: boolean
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
    },
  },
} as const
