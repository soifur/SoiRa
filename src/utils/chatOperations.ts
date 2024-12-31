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
    // First, try to find existing chat history
    const { data: existingChat } = await supabase
      .from('chat_history')
      .select('id')
      .eq('bot_id', botId)
      .eq(
        sessionData?.session ? 'user_id' : 'client_id',
        sessionData?.session ? sessionData.session.user.id : 'anonymous'
      )
      .maybeSingle();

    const messageData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp?.toISOString()
    }));

    if (existingChat) {
      const { error: updateError } = await supabase
        .from('chat_history')
        .update({ messages: messageData })
        .eq('id', existingChat.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('chat_history')
        .insert({
          bot_id: botId,
          messages: messageData,
          ...(sessionData?.session
            ? { user_id: sessionData.session.user.id }
            : { client_id: 'anonymous' })
        });

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Error updating chat history:", error);
    throw error;
  }
};