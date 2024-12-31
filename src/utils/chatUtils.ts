import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/MessageList";

export const updateChatHistory = async (
  botId: string,
  messages: Array<{ role: string; content: string; timestamp?: Date }>,
  userId?: string,
  clientId: string = 'anonymous'
) => {
  try {
    const chatData = {
      bot_id: botId,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString()
      })),
      ...(userId 
        ? { user_id: userId }
        : { client_id: clientId }
      )
    };

    // First, try to find existing chat history
    const { data: existingChat } = await supabase
      .from('chat_history')
      .select('id')
      .eq('bot_id', botId)
      .eq(userId ? 'user_id' : 'client_id', userId || clientId)
      .single();

    if (existingChat) {
      const { error } = await supabase
        .from('chat_history')
        .update(chatData)
        .eq('id', existingChat.id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('chat_history')
        .insert(chatData);
      
      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateChatHistory:", error);
    throw error;
  }
};