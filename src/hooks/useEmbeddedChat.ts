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
      if (!bot?.memory_enabled) {
        console.log("Memory not enabled for bot:", bot.id);
        return;
      }
      
      console.log("Updating user context for bot:", bot.id, "client:", clientId);
      console.log("Memory instructions:", bot.memory_instructions);
      console.log("Memory model:", bot.memory_model);
      console.log("New context to save:", newContext);
      
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
      if (!bot?.memory_enabled) {
        console.log("Memory not enabled for bot:", bot.id);
        return;
      }

      try {
        console.log("Fetching user context for bot:", bot.id, "client:", clientId);
        console.log("Memory settings:", {
          enabled: bot.memory_enabled,
          instructions: bot.memory_instructions,
          model: bot.memory_model
        });
        
        const context = await UserContextService.getUserContext(bot.id, clientId, sessionToken);
        console.log("Fetched initial user context:", context);
        setUserContext(context || {});
      } catch (error) {
        console.error("Error fetching user context:", error);
        setUserContext({});
      }
    };

    fetchUserContext();
  }, [bot.id, bot.memory_enabled, bot.memory_instructions, bot.memory_model, clientId, sessionToken]);

  useEffect(() => {
    const initializeChat = async () => {
      if (chatId) {
        console.log("Loading existing chat:", chatId);
        const existingMessages = await loadExistingChat(chatId);
        setMessages(existingMessages || []);
      } else {
        console.log("No existing chat, starting fresh");
        setMessages([]);
      }
    };

    initializeChat();
  }, [chatId, loadExistingChat]);

  useEffect(() => {
    if (chatId && messages.length > 0) {
      console.log("Saving chat history for chat:", chatId);
      saveChatHistory(messages, chatId);
    }
  }, [messages, chatId, saveChatHistory]);

  const handleCreateNewChat = async () => {
    console.log("Creating new chat");
    setMessages([]); // Clear messages immediately
    const newChatId = await createNewChat();
    if (bot?.memory_enabled) {
      console.log("Resetting context for new chat");
      setUserContext({}); // Reset context for new chat
    }
    return newChatId;
  };

  return {
    messages,
    isLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat: handleCreateNewChat,
    userContext
  };
};