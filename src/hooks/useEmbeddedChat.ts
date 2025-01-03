import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatService } from "@/services/ChatService";
import { createMessage } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { Bot, Message } from "@/components/chat/types/chatTypes";
import { UserContextService } from "@/services/UserContextService";

interface ChatMessage {
  role: string;
  content: string;
}

export const useEmbeddedChat = (bot: Bot, clientId: string, shareKey?: string, sessionToken?: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    fetchUserContext();
  }, [bot.id, clientId, sessionToken]);

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

  const updateUserContext = async (newContext: any) => {
    try {
      console.log("Updating user context:", newContext);
      await UserContextService.updateUserContext(bot.id, clientId, newContext, sessionToken);
      setUserContext(newContext);
    } catch (error) {
      console.error("Error updating user context:", error);
    }
  };

  const loadExistingChat = async (specificChatId?: string) => {
    if (!bot.id || !sessionToken) return;

    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('bot_id', bot.id)
        .eq('session_token', sessionToken)
        .eq('deleted', 'no');

      if (specificChatId) {
        query = query.eq('id', specificChatId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data: existingChat, error } = await query.single();

      if (error && !specificChatId) {
        console.log("No existing chat found, creating new one");
        await createNewChat();
        return;
      }

      if (existingChat) {
        console.log("Found existing chat for session:", sessionToken);
        setChatId(existingChat.id);
        const chatMessages = Array.isArray(existingChat.messages) 
          ? existingChat.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
              id: msg.id || uuidv4()
            }))
          : [];
        setMessages(chatMessages);
      } else if (!specificChatId) {
        await createNewChat();
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      if (!specificChatId) {
        await createNewChat();
      }
    }
  };

  const createNewChat = async () => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      setMessages([]);
      return newChatId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const convertToServiceMessage = (msg: Message): ChatMessage => ({
    role: msg.role,
    content: msg.content
  });

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionToken) return;

    try {
      setIsLoading(true);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createNewChat();
        if (!currentChatId) return;
        setChatId(currentChatId);
      }

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      const contextMessages = newMessages.map(convertToServiceMessage);

      // Include user context in the conversation
      if (bot.memory_enabled && userContext) {
        const contextPrompt = `Previous context about the user: ${JSON.stringify(userContext)}\n\nCurrent conversation:`;
        contextMessages.unshift({
          role: "system",
          content: contextPrompt
        });
      }

      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API with context");
        botResponse = await ChatService.sendGeminiMessage(contextMessages, bot);
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API with context");
        botResponse = await ChatService.sendOpenRouterMessage(
          contextMessages,
          bot,
          abortControllerRef.current.signal
        );
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Update user context if memory is enabled
      if (bot.memory_enabled) {
        const memoryBot = {
          ...bot,
          model: bot.memory_model || "openrouter",
          apiKey: bot.memory_api_key || "",
          instructions: bot.memory_instructions || "You are a context extraction bot. Extract and update the user context based on the conversation. Return ONLY a JSON object with the updated context.",
        };

        try {
          const contextUpdatePrompt = `Previous context: ${JSON.stringify(userContext)}\n\nConversation to analyze:\n${updatedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nExtract and update the user context based on this conversation. Return ONLY a JSON object with the updated context.`;
          
          let newContextResponse;
          if (memoryBot.model === "gemini") {
            newContextResponse = await ChatService.sendGeminiMessage([{ role: "user", content: contextUpdatePrompt }], memoryBot);
          } else {
            newContextResponse = await ChatService.sendOpenRouterMessage([{ role: "user", content: contextUpdatePrompt }], memoryBot);
          }

          try {
            const newContext = JSON.parse(newContextResponse);
            console.log("New context extracted:", newContext);
            await updateUserContext(newContext);
          } catch (parseError) {
            console.error("Error parsing context response:", parseError);
          }
        } catch (memoryError) {
          console.error("Error updating memory:", memoryError);
        }
      }

      const messagesToSave = updatedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString()
      }));

      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequence = (latestChat?.sequence_number || 0) + 1;

      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: currentChatId,
          bot_id: bot.id,
          messages: messagesToSave,
          client_id: clientId,
          share_key: shareKey,
          session_token: sessionToken,
          sequence_number: nextSequence,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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