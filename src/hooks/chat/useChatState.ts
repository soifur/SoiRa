import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";
import { createMessage } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { useSessionToken } from "@/hooks/useSessionToken";
import { useBotsData } from "@/hooks/useBotsData";

export const useChatState = (selectedBotId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const { sessionToken } = useSessionToken();
  const { allBots } = useBotsData();
  const { toast } = useToast();

  const handleNewChat = () => {
    setChatId(null);
    setMessages([]);
    toast({
      title: "New Chat",
      description: "Starting a new chat session",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        setChatId(selectedChatId);
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
    if (!selectedBotId || !message.trim()) return;

    try {
      setIsLoading(true);
      setIsStreaming(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "", true);
      setMessages([...newMessages, loadingMessage]);

      const selectedBot = allBots.find(bot => bot.id === selectedBotId);
      if (!selectedBot) {
        throw new Error("Selected bot not found");
      }

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

      const { data: { user } } = await supabase.auth.getUser();
      const currentChatId = chatId || uuidv4();

      if (!chatId) {
        setChatId(currentChatId);
      }

      const chatData = {
        id: currentChatId,
        bot_id: selectedBotId,
        messages: [...newMessages, createMessage("assistant", response)].map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toISOString(),
        })),
        user_id: user?.id,
        session_token: !user ? sessionToken : null,
        sequence_number: 1,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData);

      if (error) throw error;

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
    chatId,
    handleNewChat,
    handleSelectChat,
    handleSignOut,
    sendMessage
  };
};