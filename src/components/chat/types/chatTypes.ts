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