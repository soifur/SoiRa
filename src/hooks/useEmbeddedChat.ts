import { Bot, Message } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";
import { ChatService } from "@/services/ChatService";
import { UserContextService } from "@/services/UserContextService";
import { createMessage } from "@/utils/messageUtils";
import { useChatState } from "./chat/useChatState";
import { useChatPersistence } from "./chat/useChatPersistence";
import { supabase } from "@/integrations/supabase/client";

export const useEmbeddedChat = (
  bot: Bot, 
  clientId: string, 
  shareKey?: string, 
  sessionToken?: string | null
) => {
  const { toast } = useToast();
  const { 
    messages, 
    setMessages, 
    isLoading, 
    setIsLoading, 
    chatId, 
    setChatId,
    createNewChat: createNewChatState 
  } = useChatState();
  const { saveChatHistory } = useChatPersistence();

  const createNewChat = async () => {
    if (!sessionToken) return null;
    const newChatId = await createNewChatState(sessionToken);
    return newChatId;
  };

  const loadExistingChat = async (selectedChatId: string) => {
    try {
      const { data: chatData, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', selectedChatId)
        .single();

      if (error) throw error;

      if (chatData) {
        setChatId(chatData.id);
        setMessages(chatData.messages || []);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string, clientId: string) => {
    if (!message.trim() || !sessionToken) return;

    try {
      setIsLoading(true);
      
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createNewChat();
        if (!currentChatId) return;
      }

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API with context");
        botResponse = await ChatService.sendGeminiMessage(
          newMessages, 
          bot,
          sessionToken,
          undefined,
          clientId
        );
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API with context");
        botResponse = await ChatService.sendOpenRouterMessage(
          newMessages, 
          bot,
          sessionToken,
          undefined,
          clientId
        );
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Only update context if memory is enabled
      if (bot.memory_enabled) {
        await UserContextService.updateContext(updatedMessages, bot, clientId, sessionToken);
      }

      await saveChatHistory(
        updatedMessages,
        currentChatId,
        bot.id,
        sessionToken,
        undefined,
        clientId
      );

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat
  };
};