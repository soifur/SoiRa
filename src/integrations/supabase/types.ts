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
      bots: {
        Row: {
          api_key: string
          avatar: string | null
          created_at: string
          id: string
          instructions: string | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model: string | null
          starters: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          avatar?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model?: string | null
          starters?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          avatar?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          model?: Database["public"]["Enums"]["bot_model"]
          name?: string
          open_router_model?: string | null
          starters?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          bot_id: string
          client_id: string | null
          created_at: string | null
          id: string
          messages: Json
          share_key: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          share_key?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          share_key?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      shared_bots: {
        Row: {
          api_key_id: string | null
          bot_id: string
          bot_name: string
          created_at: string | null
          expires_at: string | null
          id: string
          instructions: string | null
          model: string
          open_router_model: string | null
          share_key: string
          short_key: string | null
          starters: string[] | null
        }
        Insert: {
          api_key_id?: string | null
          bot_id: string
          bot_name: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          model: string
          open_router_model?: string | null
          share_key: string
          short_key?: string | null
          starters?: string[] | null
        }
        Update: {
          api_key_id?: string | null
          bot_id?: string
          bot_name?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          model?: string
          open_router_model?: string | null
          share_key?: string
          short_key?: string | null
          starters?: string[] | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_short_key: {
        Args: {
          length?: number
        }
        Returns: string
      }
    }
    Enums: {
      bot_model: "gemini" | "claude" | "openai" | "openrouter"
      user_role: "super_admin" | "admin" | "user"
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
