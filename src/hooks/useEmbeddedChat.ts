import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatService } from "@/services/ChatService";
import { UserContextService } from "@/services/UserContextService";
import { createMessage } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { Bot, Message } from "@/components/chat/types/chatTypes";

interface ChatMessage {
  role: string;
  content: string;
}

export const useEmbeddedChat = (bot: Bot, clientId: string, shareKey?: string, sessionToken?: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();

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

      const { data: existingChat, error } = await query.maybeSingle();

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

  const sendMessage = async (message: string, clientId: string) => {
    if (!message.trim() || !sessionToken) return;

    try {
      setIsLoading(true);
      
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = await createNewChat();
        if (!currentChatId) return;
        setChatId(currentChatId);
      }

      // Get all previous messages for context
      const { data: previousChats } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('bot_id', bot.id)
        .eq('session_token', sessionToken)
        .eq('deleted', 'no')
        .order('created_at', { ascending: true });

      const allPreviousMessages = previousChats?.flatMap(chat => 
        Array.isArray(chat.messages) ? chat.messages : []
      ).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })) || [];

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      const contextMessages = [...allPreviousMessages, ...newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))];

      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API with context");
        botResponse = await ChatService.sendGeminiMessage(
          contextMessages, 
          bot,
          sessionToken,
          undefined,
          clientId
        );
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API with context");
        botResponse = await ChatService.sendOpenRouterMessage(
          contextMessages, 
          bot,
          sessionToken,
          undefined,
          clientId
        );
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Update user context after getting bot response
      console.log('Updating user context after bot response');
      await UserContextService.updateContext(updatedMessages, bot, clientId, sessionToken);

      const messagesToSave = updatedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString()
      }));

      // Get the next sequence number
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