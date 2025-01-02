import { Bot, Message } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";
import { ChatService } from "@/services/ChatService";
import { UserContextService } from "@/services/UserContextService";
import { createMessage } from "@/utils/messageUtils";
import { useChatState } from "./chat/useChatState";
import { useChatPersistence } from "./chat/useChatPersistence";

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
    createNewChat 
  } = useChatState();
  const { saveChatHistory } = useChatPersistence();

  const sendMessage = async (message: string, clientId: string) => {
    if (!message.trim() || !sessionToken) return;

    try {
      setIsLoading(true);
      
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createNewChat(sessionToken);
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
        console.log('Updating user context after bot response');
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
  };
};