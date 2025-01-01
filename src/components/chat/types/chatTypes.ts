import { Json } from "@/integrations/supabase/types";

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

export interface Bot {
  id: string;
  name: string;
  instructions?: string;
  avatar?: string;
  model: string;
  starters?: string[];
  api_key: string;
  open_router_model?: string;
  voice_enabled?: boolean;
}

export interface ChatHistoryItem {
  id: string;
  messages: Message[];
  created_at: string;
  sequence_number: number;
}

export interface ChatHistoryData {
  id?: string;
  bot_id: string;
  messages?: Json;
  client_id?: string;
  share_key?: string;
  sequence_number: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}