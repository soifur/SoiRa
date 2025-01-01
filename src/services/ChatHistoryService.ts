import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/chat/types/chatTypes";

export class ChatHistoryService {
  static async getLatestSequenceNumber(botId: string): Promise<number> {
    console.log("Getting latest sequence number for bot:", botId);
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('sequence_number')
      .eq('bot_id', botId)
      .order('sequence_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error getting sequence number:", error);
      return 1;
    }

    console.log("Latest chat history entry:", data);
    const nextSequence = data && data.length > 0 ? data[0].sequence_number + 1 : 1;
    console.log("Next sequence number will be:", nextSequence);
    return nextSequence;
  }

  static async createNewChatHistory(newChatId: string, botId: string, clientId: string, shareKey?: string): Promise<void> {
    console.log("Creating new chat history with params:", { newChatId, botId, clientId, shareKey });
    
    const sequence_number = await this.getLatestSequenceNumber(botId);
    console.log("Got sequence number for new chat:", sequence_number);

    const chatData = {
      id: newChatId,
      bot_id: botId,
      messages: [],
      client_id: clientId,
      share_key: shareKey,
      sequence_number
    };

    console.log("Inserting new chat with data:", chatData);
    const { error } = await supabase
      .from('chat_history')
      .insert(chatData);

    if (error) {
      console.error("Error creating new chat history:", error);
      throw error;
    }
    
    console.log("Successfully created new chat history with ID:", newChatId);
  }

  static async updateChatHistory(
    chatId: string,
    botId: string,
    messages: ChatMessage[],
    clientId: string,
    shareKey?: string
  ): Promise<void> {
    console.log("Updating chat history:", { 
      chatId, 
      botId, 
      messageCount: messages.length,
      clientId,
      shareKey 
    });
    
    const jsonMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      id: msg.id
    }));

    console.log("Prepared messages for update:", jsonMessages);

    const { error } = await supabase
      .from('chat_history')
      .update({
        messages: jsonMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .eq('client_id', clientId); // Add client_id check for extra security

    if (error) {
      console.error("Error updating chat history:", error);
      throw error;
    }

    console.log("Successfully updated chat history for ID:", chatId);
  }
}