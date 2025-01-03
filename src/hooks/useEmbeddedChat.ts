import { useState, useEffect } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";
import { useMessageHandling } from "./chat/useMessageHandling";
import { useChatHistory } from "./chat/useChatHistory";
import { supabase } from "@/integrations/supabase/client";

export const useEmbeddedChat = (
  bot: Bot,
  clientId: string,
  shareKey?: string,
  sessionToken?: string | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<any>(null);

  const {
    chatId,
    loadExistingChat,
    createNewChat,
    saveChatHistory
  } = useChatHistory(bot.id, clientId, shareKey, sessionToken);

  const updateUserContext = async (newContext: any) => {
    try {
      if (bot.memory_enabled !== true) {
        console.log("Memory not enabled for bot:", bot.id);
        return;
      }
      
      const { data: existingContext } = await supabase
        .from('user_context')
        .select('context')
        .eq('bot_id', bot.id)
        .eq('client_id', clientId)
        .eq('session_token', sessionToken)
        .maybeSingle();

      const mergedContext = {
        ...(existingContext?.context || {}),
        ...newContext
      };

      const { error } = await supabase
        .from('user_context')
        .upsert({
          bot_id: bot.id,
          client_id: clientId,
          session_token: sessionToken,
          context: mergedContext,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'bot_id,client_id,session_token'
        });

      if (error) throw error;
      setUserContext(mergedContext);
      console.log("Context updated successfully");
    } catch (error) {
      console.error("Error updating user context:", error);
    }
  };

  const {
    isLoading,
    sendMessage
  } = useMessageHandling(bot, messages, setMessages, userContext, updateUserContext);

  useEffect(() => {
    const fetchUserContext = async () => {
      if (bot.memory_enabled !== true) {
        console.log("Memory not enabled for bot:", bot.id);
        return;
      }

      try {
        const { data: context, error } = await supabase
          .from('user_context')
          .select('context')
          .eq('bot_id', bot.id)
          .eq('client_id', clientId)
          .eq('session_token', sessionToken)
          .maybeSingle();

        if (error) throw error;
        setUserContext(context?.context || {});
      } catch (error) {
        console.error("Error fetching user context:", error);
        setUserContext({});
      }
    };

    fetchUserContext();
  }, [bot.id, bot.memory_enabled, clientId, sessionToken]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!chatId) {
        console.log("No existing chat ID, creating new chat");
        await createNewChat();
        return;
      }

      console.log("Loading existing chat:", chatId);
      const existingMessages = await loadExistingChat(chatId);
      if (existingMessages && existingMessages.length > 0) {
        console.log("Setting existing messages:", existingMessages.length);
        setMessages(existingMessages);
      }
    };

    initializeChat();
  }, [chatId]);

  useEffect(() => {
    const saveMessages = async () => {
      if (chatId && messages.length > 0) {
        console.log("Saving chat history for chat:", chatId);
        await saveChatHistory(messages, chatId);
      }
    };

    saveMessages();
  }, [messages, chatId]);

  const clearMessages = () => {
    setMessages([]);
  };

  const handleCreateNewChat = async () => {
    console.log("Creating new chat");
    clearMessages();
    const newChatId = await createNewChat();
    return newChatId;
  };

  return {
    messages,
    isLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat: handleCreateNewChat,
    clearMessages,
    userContext
  };
};