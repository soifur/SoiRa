import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/components/chat/types/chatTypes";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { createMessage } from "@/utils/messageUtils";
import { ChatService } from "@/services/ChatService";
import { Bot } from "./useBots";

export const useChat = (selectedBot: Bot | undefined, sessionToken: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    toast({
      title: "New Chat",
      description: "Starting a new chat session",
    });
  };

  const handleSelectChat = async (selectedChatId: string) => {
    try {
      const { data: chat } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', selectedChatId)
        .single();

      if (chat && chat.messages) {
        const typedMessages = (chat.messages as any[]).map((msg): Message => ({
          id: msg.id || uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          isBot: msg.isBot,
          avatar: msg.avatar
        }));
        setMessages(typedMessages);
        setCurrentChatId(selectedChatId);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string) => {
    if (!selectedBot || !message.trim()) return;

    try {
      setIsLoading(true);
      setIsStreaming(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "", true);
      setMessages([...newMessages, loadingMessage]);

      let response = "";
      if (selectedBot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(
          newMessages,
          selectedBot,
          undefined,
          (chunk: string) => {
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + chunk }
                ];
              }
              return prev;
            });
          }
        );
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
        const botMessage = createMessage("assistant", response);
        setMessages([...newMessages, botMessage]);
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const chatId = currentChatId || uuidv4();
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const finalMessages = [...newMessages, createMessage("assistant", response)];
      const userMessageCount = finalMessages.filter(msg => msg.role === 'user').length;

      const chatData = {
        id: chatId,
        bot_id: selectedBot.id,
        messages: finalMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toISOString(),
        })),
        user_id: user?.id || null,
        session_token: !user ? sessionToken : null,
        sequence_number: 1,
        updated_at: new Date().toISOString(),
        messages_used: userMessageCount
      };

      console.log("Saving chat with data:", chatData);

      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData);

      if (error) {
        console.error("Error saving chat:", error);
        throw error;
      }

      console.log("Chat saved successfully");

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return {
    messages,
    isLoading,
    isStreaming,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    sendMessage
  };
};