import { Message } from "@/components/chat/MessageList";
import { Json } from "@/integrations/supabase/types";

export interface ChatRecord {
  id: string;
  botId: string;
  messages: Message[];
  timestamp: string;
  shareKey?: string;
  type: string;
  user_id?: string;
  client_id?: string;
}

export interface SupabaseChatRecord {
  id: string;
  bot_id: string;
  messages: Json;
  created_at: string;
  share_key?: string;
  user_id?: string;
  client_id?: string;
}