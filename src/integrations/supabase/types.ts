export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "super_admin" | "admin" | "user"
export type BotModel = "gemini" | "claude" | "openai" | "openrouter"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
          managed_by: string | null
          subscription_status: string | null
          avatar: string | null
          language: string | null
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          created_at?: string
          updated_at?: string
          managed_by?: string | null
          subscription_status?: string | null
          avatar?: string | null
          language?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
          managed_by?: string | null
          subscription_status?: string | null
          avatar?: string | null
          language?: string | null
        }
      }
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
          memory_enabled: boolean | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model: string | null
          starters: string[] | null
          updated_at: string
          user_id: string
          voice_enabled: boolean | null
        }
        Insert: {
          api_key: string
          avatar?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          memory_enabled?: boolean | null
          model: Database["public"]["Enums"]["bot_model"]
          name: string
          open_router_model?: string | null
          starters?: string[] | null
          updated_at?: string
          user_id: string
          voice_enabled?: boolean | null
        }
        Update: {
          api_key?: string
          avatar?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          memory_enabled?: boolean | null
          model?: Database["public"]["Enums"]["bot_model"]
          name?: string
          open_router_model?: string | null
          starters?: string[] | null
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          bot_id: string
          client_id: string | null
          created_at: string | null
          deleted: string | null
          id: string
          messages: Json
          sequence_number: number
          session_token: string | null
          share_key: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          client_id?: string | null
          created_at?: string | null
          deleted?: string | null
          id?: string
          messages?: Json
          sequence_number: number
          session_token?: string | null
          share_key?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          client_id?: string | null
          created_at?: string | null
          deleted?: string | null
          id?: string
          messages?: Json
          sequence_number?: number
          session_token?: string | null
          share_key?: string | null
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
      shared_bots: {
        Row: {
          api_key_id: string | null
          avatar: string | null
          bot_id: string
          bot_name: string
          created_at: string | null
          expires_at: string | null
          id: string
          instructions: string | null
          memory_api_key: string | null
          memory_enabled: boolean | null
          memory_instructions: string | null
          memory_model: string | null
          model: string
          open_router_model: string | null
          share_key: string
          short_key: string | null
          starters: string[] | null
          voice_enabled: boolean | null
        }
        Insert: {
          api_key_id?: string | null
          avatar?: string | null
          bot_id: string
          bot_name: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          memory_api_key?: string | null
          memory_enabled?: boolean | null
          memory_instructions?: string | null
          memory_model?: string | null
          model: string
          open_router_model?: string | null
          share_key: string
          short_key?: string | null
          starters?: string[] | null
          voice_enabled?: boolean | null
        }
        Update: {
          api_key_id?: string | null
          avatar?: string | null
          bot_id?: string
          bot_name?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          instructions?: string | null
          memory_api_key?: string | null
          memory_enabled?: boolean | null
          memory_instructions?: string | null
          memory_model?: string | null
          model?: string
          open_router_model?: string | null
          share_key: string
          short_key?: string | null
          starters?: string[] | null
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
      user_context: {
        Row: {
          bot_id: string
          client_id: string
          context: Json | null
          created_at: string | null
          id: string
          last_updated: string | null
          session_token: string | null
          user_id: string | null
        }
        Insert: {
          bot_id: string
          client_id: string
          context?: Json | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Update: {
          bot_id?: string
          client_id?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          session_token?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      bot_model: BotModel
      user_role: UserRole
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
