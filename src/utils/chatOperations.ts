import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/MessageList";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";

export const sendChatMessage = async (
  message: string,
  messages: Array<{ role: string; content: string; timestamp?: Date }>,
  bot: Bot
) => {
  let response: string;

  if (bot.model === "openrouter") {
    response = await ChatService.sendOpenRouterMessage(messages, bot);
  } else if (bot.model === "gemini") {
    response = await ChatService.sendGeminiMessage(messages, bot);
  } else {
    throw new Error("Unsupported model type");
  }

  return response;
};

export const updateChatHistory = async (
  botId: string,
  messages: Array<{ role: string; content: string; timestamp?: Date }>,
  sessionData: { session: { user: { id: string } } } | null
) => {
  try {
    const messageData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp?.toISOString()
    }));

    let clientId = 'anonymous';
    try {
      const { data: { user_ip } } = await supabase.functions.invoke('get-client-ip');
      if (user_ip) {
        clientId = user_ip;
      }
    } catch (error) {
      console.warn("Could not get client IP, using anonymous:", error);
    }

    // First, try to find existing chat history
    const { data: existingChat, error: findError } = await supabase
      .from('chat_history')
      .select('id')
      .eq('bot_id', botId)
      .eq(sessionData?.session ? 'user_id' : 'client_id', sessionData?.session ? sessionData.session.user.id : clientId)
      .maybeSingle();

    if (findError) {
      console.error("Error finding chat history:", findError);
      throw findError;
    }

    let error;
    const chatData = {
      bot_id: botId,
      messages: messageData,
      ...(sessionData?.session 
        ? { user_id: sessionData.session.user.id }
        : { client_id: clientId })
    };

    if (existingChat) {
      // Update existing chat
      const { error: updateError } = await supabase
        .from('chat_history')
        .update(chatData)
        .eq('id', existingChat.id);
      error = updateError;
    } else {
      // Insert new chat
      const { error: insertError } = await supabase
        .from('chat_history')
        .insert(chatData);
      error = insertError;
    }

    if (error) {
      console.error("Error updating chat history:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateChatHistory:", error);
    throw error;
  }
};