import { Json } from "@/integrations/supabase/types";
import { BaseModel } from "@/hooks/useBots";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

export interface MessageJson {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
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

export interface BotSettings {
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  response_format: { type: string; [key: string]: any };
  tool_config: any[];
  system_templates: any[];
  memory_enabled: boolean;
  memory_enabled_model: boolean;
}