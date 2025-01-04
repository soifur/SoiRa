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

  // Create a debounced version of saveChatHistory with a longer delay
  const debouncedSave = debounce(async (msgs: Message[]) => {
    if (!chatId || !msgs.length) return;
    
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
  }, 2000); // Increased from 1000ms to 2000ms

  // Save messages whenever they change
  useEffect(() => {
    let mounted = true;

    if (messages.length > 0 && chatId && mounted) {
      debouncedSave(messages);
    }

    return () => {
      mounted = false;
    };
  }, [messages, chatId]); // Only depend on messages and chatId

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

  const initializeChat = async () => {
    try {
      if (!chatId) {
        console.log("No existing chat ID, creating new chat");
        await createNewChat();
      } else {
        console.log("Loading existing chat:", chatId);
        const existingMessages = await loadExistingChat(chatId);
        if (existingMessages && existingMessages.length > 0) {
          console.log("Setting existing messages:", existingMessages.length);
          setMessages(existingMessages);
        }
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast({
        title: "Error",
        description: "Failed to initialize chat",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (chatId) {
      initializeChat();
    }
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