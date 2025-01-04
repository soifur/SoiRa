import { useState, useEffect } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";
import { useMessageHandling } from "./chat/useMessageHandling";
import { useChatHistory } from "./chat/useChatHistory";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useEmbeddedChat = (
  bot: Bot,
  clientId: string,
  shareKey?: string,
  sessionToken?: string | null
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userContext, setUserContext] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    chatId,
    loadExistingChat,
    createNewChat,
    saveChatHistory
  } = useChatHistory(bot.id, clientId, shareKey, sessionToken);

  const updateUserContext = async (newContext: any) => {
    try {
      console.log("Current memory_enabled value:", bot.memory_enabled);
      
      // Strict boolean check for TRUE
      if (bot.memory_enabled !== true) {
        console.log("Memory is not explicitly TRUE, skipping all memory operations");
        setUserContext(null);
        return;
      }
      
      console.log("Memory is TRUE, updating context:", newContext);
      await UserContextService.updateUserContext(bot.id, clientId, newContext, sessionToken);
      setUserContext(newContext);
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
      console.log("Checking memory_enabled status:", bot.memory_enabled);
      
      // Strict boolean check for TRUE
      if (bot.memory_enabled !== true) {
        console.log("Memory is not explicitly TRUE, skipping context fetch");
        setUserContext(null);
        return;
      }

      try {
        console.log("Memory is TRUE, fetching user context for bot:", bot.id, "client:", clientId);
        const context = await UserContextService.getUserContext(bot.id, clientId, sessionToken);
        console.log("Fetched initial user context:", context);
        setUserContext(context || {});
      } catch (error) {
        console.error("Error fetching user context:", error);
        setUserContext({});
      }
    };

    fetchUserContext();
  }, [bot.id, bot.memory_enabled, clientId, sessionToken]);

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

  useEffect(() => {
    initializeChat();
  }, [chatId]);

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
    userContext,
    isSaving
  };
};