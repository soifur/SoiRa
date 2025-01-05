import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/MessageList";
import { Bot } from "@/hooks/useBots";
import { createMessage } from "./messageUtils";
import { ChatService } from "@/services/ChatService";

export const saveChatHistory = async (
  chatId: string,
  botId: string,
  messages: Message[],
  sequenceNumber: number,
  messagesUsed: number = 0,
  tokensUsed: number = 0
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const chatData = {
    id: chatId,
    bot_id: botId,
    messages: messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp?.toISOString(),
    })),
    user_id: user?.id,
    sequence_number: sequenceNumber,
    messages_used: messagesUsed,
    tokens_used: tokensUsed
  };

  const { error } = await supabase
    .from('chat_history')
    .upsert(chatData);

  if (error) throw error;
};

export const handleMessageSend = async (
  message: string,
  messages: Message[],
  bot: Bot,
  setMessages: (messages: Message[]) => void,
  onChunk?: (chunk: string) => void
) => {
  const userMessage = createMessage("user", message);
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);

  let response = "";
  if (bot.model === "openrouter") {
    response = await ChatService.sendOpenRouterMessage(
      newMessages,
      bot,
      undefined,
      onChunk
    );
  } else if (bot.model === "gemini") {
    response = await ChatService.sendGeminiMessage(newMessages, bot);
  }

  return { response, newMessages };
};