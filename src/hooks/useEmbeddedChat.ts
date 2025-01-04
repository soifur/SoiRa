import { useState, useEffect } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";
import { useMessageHandling } from "./chat/useMessageHandling";
import { useChatHistory } from "./chat/useChatHistory";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const {
    chatId,
    loadExistingChat,
    createNewChat,
    saveChatHistory
  } = useChatHistory(bot.id, clientId, shareKey, sessionToken);

  // Create a debounced version of saveChatHistory
  const debouncedSave = debounce(async (msgs: Message[]) => {
    if (!chatId || !msgs.length) {
      console.log("Skipping save - no chat ID or messages");
      return;
    }
    
    try {
      console.log("Starting debounced save of", msgs.length, "messages");
      setIsSaving(true);
      await saveChatHistory(msgs, chatId);
    } catch (error) {
      console.error("Error in debounced save:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, 1000);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && chatId) {
      console.log("Triggering save for", messages.length, "messages");
      debouncedSave(messages);
    }
  }, [messages, chatId]);

  const updateUserContext = async (newContext: any) => {
    try {
      if (bot.memory_enabled !== true) {
        console.log("Memory is not enabled, skipping context update");
        setUserContext(null);
        return;
      }
      
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
      if (bot.memory_enabled !== true) {
        console.log("Memory not enabled, skipping context fetch");
        setUserContext(null);
        return;
      }

      try {
        const context = await UserContextService.getUserContext(bot.id, clientId, sessionToken);
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