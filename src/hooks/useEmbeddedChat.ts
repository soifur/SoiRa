import { useState, useEffect } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";
import { useMessageHandling } from "./chat/useMessageHandling";
import { useChatHistory } from "./chat/useChatHistory";

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
      console.log("Updating user context:", newContext);
      await UserContextService.updateUserContext(bot.id, clientId, newContext, sessionToken);
      setUserContext(newContext);
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
      try {
        console.log("Fetching user context for bot:", bot.id, "client:", clientId);
        const context = await UserContextService.getUserContext(bot.id, clientId, sessionToken);
        console.log("Fetched user context:", context);
        setUserContext(context);
      } catch (error) {
        console.error("Error fetching user context:", error);
      }
    };

    fetchUserContext();
  }, [bot.id, clientId, sessionToken]);

  useEffect(() => {
    const initializeChat = async () => {
      const existingMessages = await loadExistingChat();
      setMessages(existingMessages);
    };

    initializeChat();
  }, [bot.id, sessionToken]);

  useEffect(() => {
    if (chatId && messages.length > 0) {
      saveChatHistory(messages, chatId);
    }
  }, [messages, chatId]);

  return {
    messages,
    isLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat,
    userContext
  };
};