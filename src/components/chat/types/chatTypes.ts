import { BaseModel } from "@/hooks/useBots";
import { Json } from "@/integrations/supabase/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  id?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

export interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
  model: BaseModel;
  apiKey: string;
  openRouterModel?: string;
  avatar?: string;
  accessType?: "public" | "private";
  memory_enabled?: boolean;
  quiz_mode?: boolean;
}

export interface ChatHistoryItem {
  id: string;
  messages: ChatMessage[];
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
  session_token?: string;
  avatar_url?: string;
  deleted?: string;
}