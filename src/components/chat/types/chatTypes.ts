import { Json } from "@/integrations/supabase/types";

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
  id?: string;
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