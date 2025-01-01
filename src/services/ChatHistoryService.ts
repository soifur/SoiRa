import { supabase } from "@/integrations/supabase/client";
import { ChatHistoryData, ChatMessage } from "@/components/chat/types/chatTypes";

export class ChatHistoryService {
  static async getLatestSequenceNumber(botId: string): Promise<number> {
    console.log("Getting latest sequence number for bot:", botId);
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('sequence_number')
      .eq('bot_id', botId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log("Error getting sequence number:", error);
      return 1;
    }

    const nextSequence = (data?.sequence_number || 0) + 1;
    console.log("Next sequence number:", nextSequence);
    return nextSequence;
  }

  static async createNewChatHistory(newChatId: string, botId: string, clientId: string, shareKey?: string): Promise<void> {
    console.log("Creating new chat history:", { newChatId, botId, clientId, shareKey });
    
    // Get the next sequence number
    const sequence_number = await this.getLatestSequenceNumber(botId);

    const chatData = {
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

    if (error) {
      console.error("Error creating new chat history:", error);
      throw error;
    }
  }

  static async updateChatHistory(chatId: string, botId: string, messages: ChatMessage[], clientId: string, shareKey?: string): Promise<void> {
    console.log("Updating chat history:", { chatId, botId, messages: messages.length });
    
    // Convert ChatMessage[] to a plain object array for JSON compatibility
    const jsonMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      id: msg.id
    }));

    const chatData = {
      id: chatId,
      bot_id: botId,
      messages: jsonMessages,
      client_id: clientId,
      share_key: shareKey
    };

    const { error } = await supabase
      .from('chat_history')
      .update(chatData)
      .eq('id', chatId);

    if (error) {
      console.error("Error updating chat history:", error);
      throw error;
    }
  }
}