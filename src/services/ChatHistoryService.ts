import { supabase } from "@/integrations/supabase/client";
import { ChatHistoryData, ChatMessage } from "@/components/chat/types/chatTypes";
import { v4 as uuidv4 } from 'uuid';

export class ChatHistoryService {
  static async getLatestSequenceNumber(botId: string): Promise<number> {
    const { data: latestChat } = await supabase
      .from('chat_history')
      .select('sequence_number')
      .eq('bot_id', botId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    return (latestChat?.sequence_number || 0) + 1;
  }

  static async createNewChatHistory(newChatId: string, botId: string, clientId: string, shareKey?: string): Promise<void> {
    const sequence_number = await this.getLatestSequenceNumber(botId);

    const chatData: ChatHistoryData = {
      id: newChatId,
      bot_id: botId,
      messages: [],
      client_id: clientId,
      share_key: shareKey,
      sequence_number
    };

    const { error } = await supabase
      .from('chat_history')
      .insert(chatData);

    if (error) throw error;
  }

  static async updateChatHistory(chatId: string, botId: string, messages: ChatMessage[], clientId: string, shareKey?: string): Promise<void> {
    const chatData: ChatHistoryData = {
      id: chatId,
      bot_id: botId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      client_id: clientId,
      share_key: shareKey,
      sequence_number: await this.getLatestSequenceNumber(botId)
    };

    const { error } = await supabase
      .from('chat_history')
      .update(chatData)
      .eq('id', chatId);

    if (error) throw error;
  }
}