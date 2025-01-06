export interface ChatRecord {
  id: string;
  botId: string;
  messages: ChatMessage[];
  timestamp: string;
  shareKey?: string;
  type: 'public' | 'private';
  user_id?: string;
  client_id?: string;
  sequence_number: number;
  userEmail?: string;
  userName?: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
}