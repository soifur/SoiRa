import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/MessageList";
import { ChatService } from "@/services/ChatService";
import { createMessage } from "./messageUtils";

export const saveChatHistory = async (
  chatId: string,
  botId: string,
  messages: Message[],
  nextSequenceNumber: number
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('chat_history')
    .upsert({
      id: chatId,
      bot_id: botId,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString(),
      })),
      user_id: user?.id,
      sequence_number: nextSequenceNumber,
      messages_used: messages.length,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const handleMessageSend = async (
  message: string,
  messages: Message[],
  bot: Bot,
  onUpdateMessages: (newMessages: Message[]) => void,
  onStreamUpdate?: (chunk: string) => void
) => {
  const newUserMessage = createMessage("user", message);
  const newMessages = [...messages, newUserMessage];
  onUpdateMessages(newMessages);

  const streamingMessage = createMessage("assistant", "", true, bot.avatar);
  onUpdateMessages([...newMessages, streamingMessage]);

  let response: string = "";

  if (bot.model === "openrouter") {
    response = await ChatService.sendOpenRouterMessage(
      newMessages,
      bot,
      undefined,
      (chunk: string) => {
        response += chunk;
        if (onStreamUpdate) {
          onStreamUpdate(response);
        }
      }
    );
  } else if (bot.model === "gemini") {
    response = await ChatService.sendGeminiMessage(newMessages, bot);
  } else {
    throw new Error("Unsupported model type");
  }

  return { response, newMessages };
};