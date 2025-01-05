import { Message } from "@/components/chat/MessageList";

export interface ChatRecord {
  id: string;
  botId: string;
  messages: Message[];
  timestamp: string;
  shareKey?: string;
  type: string;
  user_id?: string;
  client_id?: string;
  sequence_number: number;
}