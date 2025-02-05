export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bot_api_keys: {
        Row: {
          api_key: string
          bot_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          api_key: string
          bot_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          api_key?: string
          bot_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      bot_user_limits: {
        Row: {
          bot_id: string | null
          created_at: string
          id: string
          message_limit: number | null
          token_limit: number | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          id?: string
          message_limit?: number | null
          token_limit?: number | null
          updated_at?: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          id?: string
          message_limit?: number | null
          token_limit?: number | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "bot_user_limits_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          api_key: string
          avatar: string | null
          created_at: string
          default_bot: boolean | null
          frequency_penalty: number | null
          id: string
          instructions: string | null
          max_tokens: number | null
          memory_enabled: boolean | null
          memory_enabled_model: boolean | null
          memory_model: string | null
          message_limit: number | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model: string | null
          presence_penalty: number | null
          published: boolean | null
          quiz_mode: boolean | null
          response_format: Json | null
          starters: string[] | null
          stream: boolean | null
          system_templates: Json | null
          temperature: number | null
          token_limit: number | null
          tool_config: Json | null
          top_p: number | null
          updated_at: string
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          api_key: string
          avatar?: string | null
          created_at?: string
          default_bot?: boolean | null
          frequency_penalty?: number | null
          id?: string
          instructions?: string | null
          max_tokens?: number | null
          memory_enabled?: boolean | null
          memory_enabled_model?: boolean | null
          memory_model?: string | null
          message_limit?: number | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model?: string | null
          presence_penalty?: number | null
          published?: boolean | null
          quiz_mode?: boolean | null
          response_format?: Json | null
          starters?: string[] | null
          stream?: boolean | null
          system_templates?: Json | null
          temperature?: number | null
          token_limit?: number | null
          tool_config?: Json | null
          top_p?: number | null
          updated_at?: string
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          api_key?: string
          avatar?: string | null
          created_at?: string
          default_bot?: boolean | null
          frequency_penalty?: number | null
          id?: string
          instructions?: string | null
          max_tokens?: number | null
          memory_enabled?: boolean | null
          memory_enabled_model?: boolean | null
          memory_model?: string | null
          message_limit?: number | null
          model?: Database["public"]["Enums"]["bot_model"]
          name?: string
          open_router_model?: string | null
          presence_penalty?: number | null
          published?: boolean | null
          quiz_mode?: boolean | null
          response_format?: Json | null
          starters?: string[] | null
          stream?: boolean | null
          system_templates?: Json | null
          temperature?: number | null
          token_limit?: number | null
          tool_config?: Json | null
          top_p?: number | null
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          bot_id: string | null
          client_id: string | null
          created_at: string | null
          deleted: string | null
          id: string
          messages: Json
          messages_used: number | null
          sequence_number: number
          session_token: string | null
          share_key: string | null
          tokens_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          client_id?: string | null
          created_at?: string | null
          deleted?: string | null
          id?: string
          messages?: Json
          messages_used?: number | null
          sequence_number: number
          session_token?: string | null
          share_key?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          client_id?: string | null
          created_at?: string | null
          deleted?: string | null
          id?: string
          messages?: Json
          messages_used?: number | null
          sequence_number?: number
          session_token?: string | null
          share_key?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_bots: {
        Row: {
          bot_id: string | null
          created_at: string
          folder_id: string | null
          id: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_bots_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_bots_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          allow_signups: boolean | null
          back_half: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allow_signups?: boolean | null
          back_half?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allow_signups?: boolean | null
          back_half?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      memory_bot_settings: {
        Row: {
          api_key: string
          created_at: string
          id: string
          instructions: string | null
          model: string
          open_router_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          instructions?: string | null
          model?: string
          open_router_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          instructions?: string | null
          model?: string
          open_router_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      model_subscription_settings: {
        Row: {
          bot_id: string | null
          created_at: string
          id: string
          lifetime_max_units: number | null
          limit_type: string | null
          model: string
          reset_amount: number | null
          reset_period: Database["public"]["Enums"]["subscription_reset_period"]
          units_per_period: number
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          id?: string
          lifetime_max_units?: number | null
          limit_type?: string | null
          model: string
          reset_amount?: number | null
          reset_period: Database["public"]["Enums"]["subscription_reset_period"]
          units_per_period: number
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          id?: string
          lifetime_max_units?: number | null
          limit_type?: string | null
          model?: string
          reset_amount?: number | null
          reset_period?: Database["public"]["Enums"]["subscription_reset_period"]
          units_per_period?: number
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "model_subscription_settings_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          blocked: boolean | null
          created_at: string
          custom_instructions: string | null
          email: string
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          managed_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          blocked?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          email: string
          first_name?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          managed_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          blocked?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          email?: string
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          managed_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_configurations: {
        Row: {
          bot_id: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_configurations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_fields: {
        Row: {
          choices: string[] | null
          created_at: string | null
          field_type: Database["public"]["Enums"]["quiz_field_type"]
          id: string
          instructions: string | null
          quiz_id: string | null
          sequence_number: number
          single_section: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          choices?: string[] | null
          created_at?: string | null
          field_type: Database["public"]["Enums"]["quiz_field_type"]
          id?: string
          instructions?: string | null
          quiz_id?: string | null
          sequence_number: number
          single_section?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          choices?: string[] | null
          created_at?: string | null
          field_type?: Database["public"]["Enums"]["quiz_field_type"]
          id?: string
          instructions?: string | null
          quiz_id?: string | null
          sequence_number?: number
          single_section?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_fields_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          bot_id: string | null
          combined_instructions: string | null
          created_at: string | null
          id: string
          quiz_id: string | null
          responses: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          combined_instructions?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string | null
          responses?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          combined_instructions?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string | null
          responses?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_bots: {
        Row: {
          api_key_id: string | null
          avatar: string | null
          bot_id: string
          bot_name: string
          created_at: string | null
          expires_at: string | null
          frequency_penalty: number | null
          id: string
          instructions: string | null
          max_tokens: number | null
          memory_api_key: string | null
          memory_enabled: boolean | null
          memory_enabled_model: boolean | null
          memory_instructions: string | null
          memory_model: string | null
          model: string
          open_router_model: string | null
          presence_penalty: number | null
          published: boolean | null
          quiz_mode: boolean | null
          response_format: Json | null
          share_key: string
          short_key: string | null
          starters: string[] | null
          stream: boolean | null
          system_templates: Json | null
          temperature: number | null
          tool_config: Json | null
          top_p: number | null
          voice_enabled: boolean | null
        }
        Insert: {
          api_key_id?: string | null
          avatar?: string | null
          bot_id: string
          bot_name: string
          created_at?: string | null
          expires_at?: string | null
          frequency_penalty?: number | null
          id?: string
          instructions?: string | null
          max_tokens?: number | null
          memory_api_key?: string | null
          memory_enabled?: boolean | null
          memory_enabled_model?: boolean | null
          memory_instructions?: string | null
          memory_model?: string | null
          model: string
          open_router_model?: string | null
          presence_penalty?: number | null
          published?: boolean | null
          quiz_mode?: boolean | null
          response_format?: Json | null
          share_key: string
          short_key?: string | null
          starters?: string[] | null
          stream?: boolean | null
          system_templates?: Json | null
          temperature?: number | null
          tool_config?: Json | null
          top_p?: number | null
          voice_enabled?: boolean | null
        }
        Update: {
          api_key_id?: string | null
          avatar?: string | null
          bot_id?: string
          bot_name?: string
          created_at?: string | null
          expires_at?: string | null
          frequency_penalty?: number | null
          id?: string
          instructions?: string | null
          max_tokens?: number | null
          memory_api_key?: string | null
          memory_enabled?: boolean | null
          memory_enabled_model?: boolean | null
          memory_instructions?: string | null
          memory_model?: string | null
          model?: string
          open_router_model?: string | null
          presence_penalty?: number | null
          published?: boolean | null
          quiz_mode?: boolean | null
          response_format?: Json | null
          share_key?: string
          short_key?: string | null
          starters?: string[] | null
          stream?: boolean | null
          system_templates?: Json | null
          temperature?: number | null
          tool_config?: Json | null
          top_p?: number | null
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_bots_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "bot_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          bullet_points: Json
          created_at: string
          currency: string
          description: string
          features: Json
          id: string
          is_active: boolean | null
          message_multiplier: number
          name: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          bullet_points?: Json
          created_at?: string
          currency?: string
          description: string
          features?: Json
          id?: string
          is_active?: boolean | null
          message_multiplier?: number
          name: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          bullet_points?: Json
          created_at?: string
          currency?: string
          description?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          message_multiplier?: number
          name?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_context: {
        Row: {
          bot_id: string
          client_id: string
          combined_context: Json | null
          context: Json | null
          created_at: string | null
          id: string
          is_global: boolean | null
          last_updated: string | null
          session_token: string | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          client_id: string
          combined_context?: Json | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          last_updated?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          client_id?: string
          combined_context?: Json | null
          context?: Json | null
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          last_updated?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          tier_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          status?: string
          tier_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          tier_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_token_usage: {
        Args: {
          p_user_id: string
          p_model: string
          p_tokens: number
        }
        Returns: boolean
      }
      generate_short_key: {
        Args: {
          length?: number
        }
        Returns: string
      }
      is_back_half_available: {
        Args: {
          back_half: string
        }
        Returns: boolean
      }
    }
    Enums: {
      bot_model: "gemini" | "claude" | "openai" | "openrouter"
      learning_style: "visual" | "auditory" | "reading" | "kinesthetic"
      question_type: "text" | "single_choice" | "multiple_choice"
      quiz_field_type:
        | "text"
        | "email"
        | "phone"
        | "single_choice"
        | "multiple_choice"
      quiz_question_type: "text" | "checkbox"
      quiz_status: "not_started" | "in_progress" | "completed"
      subscription_reset_period: "daily" | "weekly" | "monthly" | "never"
      user_role: "super_admin" | "admin" | "user" | "paid_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
