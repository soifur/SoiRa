import { useState, useEffect } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";
import { useMessageHandling } from "./chat/useMessageHandling";
import { useChatHistory } from "./chat/useChatHistory";

// Debounce function
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
      // Only update context if memory is enabled
      if (bot.memory_enabled !== true) {
        console.log("Memory not enabled for bot:", bot.id, "- skipping context update");
        return;
      }
      
      console.log("Updating memory with context:", newContext);
      
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
      // Only fetch context if memory is enabled
      if (bot.memory_enabled !== true) {
        console.log("Memory not enabled for bot:", bot.id, "- skipping context fetch");
        setUserContext(null);
        return;
      }

      try {
        console.log("Fetching user context for bot:", bot.id, "client:", clientId);
        const context = await UserContextService.getUserContext(bot.id, clientId, sessionToken);
        console.log("Fetched initial user context:", context);
        setUserContext(context || {
          name: null,
          faith: null,
          likes: [],
          topics: []
        });
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

  // Create a debounced version of saveChatHistory that runs independently
  const debouncedSave = debounce(async (msgs: Message[], cId: string) => {
    if (!cId || msgs.length === 0) return;
    
    setIsSaving(true);
    try {
      await saveChatHistory(msgs, cId);
    } catch (error) {
      console.error("Error saving chat history:", error);
    } finally {
      setIsSaving(false);
    }
  }, 1000);

  useEffect(() => {
    if (chatId && messages.length > 0) {
      // Fire and forget - don't await the save operation
      debouncedSave(messages, chatId);
    }
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
    userContext,
    isSaving
  };
};