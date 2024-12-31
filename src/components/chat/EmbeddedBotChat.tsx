import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { EmbeddedChatHeader } from "./embedded/EmbeddedChatHeader";
import { EmbeddedChatMessages } from "./embedded/EmbeddedChatMessages";
import { ChatInput } from "./ChatInput";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { sendGeminiMessage, sendOpenAIMessage, sendClaudeMessage, sendOpenRouterMessage } from "@/services/ChatService";

interface Message {
  role: string;
  content: string;
  timestamp?: Date;
}

export const EmbeddedBotChat = () => {
  const { shareKey } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [bot, setBot] = useState<Bot | null>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const { toast } = useToast();

  const loadChatHistory = useCallback(async (shareKey: string) => {
    try {
      const { data: historyData } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('share_key', shareKey)
        .single();

      if (historyData && Array.isArray(historyData.messages)) {
        setMessages(historyData.messages as Message[]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  const saveChatHistory = useCallback(async (newMessages: Message[]) => {
    if (!shareKey || !bot) return;

    try {
      const { data: existingChat } = await supabase
        .from('chat_history')
        .select('id')
        .eq('share_key', shareKey)
        .single();

      const messageData = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString()
      }));

      if (existingChat) {
        await supabase
          .from('chat_history')
          .update({ 
            messages: messageData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingChat.id);
      } else {
        await supabase
          .from('chat_history')
          .insert({
            bot_id: bot.id,
            share_key: shareKey,
            messages: messageData
          });
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [shareKey, bot]);

  useEffect(() => {
    const loadBotConfig = async () => {
      if (!shareKey) return;

      try {
        const { data: sharedBot, error: sharedBotError } = await supabase
          .from('shared_bots')
          .select(`
            *,
            bot_api_keys (
              api_key
            )
          `)
          .eq('share_key', shareKey)
          .single();

        if (sharedBotError) throw sharedBotError;

        const botConfig: Bot = {
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: sharedBot.model as "gemini" | "claude" | "openai" | "openrouter",
          apiKey: sharedBot.bot_api_keys?.api_key || "",
          openRouterModel: sharedBot.open_router_model,
        };

        setBot(botConfig);
        await loadChatHistory(shareKey);
      } catch (error) {
        console.error("Error loading bot configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load bot configuration",
          variant: "destructive",
        });
      }
    };

    loadBotConfig();
  }, [shareKey, toast, loadChatHistory]);

  const handleScroll = () => {
    setUserScrolled(true);
  };

  const handleSend = async (message: string) => {
    if (!bot) return;

    const newMessage = { role: "user", content: message, timestamp: new Date() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages);

    try {
      let response: string;
      switch (bot.model) {
        case "gemini":
          response = await sendGeminiMessage(message, messages, bot);
          break;
        case "claude":
          response = await sendClaudeMessage(message, messages, bot);
          break;
        case "openai":
          response = await sendOpenAIMessage(message, messages, bot);
          break;
        case "openrouter":
          response = await sendOpenRouterMessage(message, messages, bot);
          break;
        default:
          throw new Error("Invalid model selected");
      }

      const botResponse = { role: "assistant", content: response, timestamp: new Date() };
      const newMessages = [...updatedMessages, botResponse];
      setMessages(newMessages);
      await saveChatHistory(newMessages);
      setUserScrolled(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = (starter: string) => {
    handleSend(starter);
  };

  const handleClearChat = async () => {
    setMessages([]);
    await saveChatHistory([]);
  };

  if (!bot) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <EmbeddedChatHeader bot={bot} onClearChat={handleClearChat} />
      <EmbeddedChatMessages
        messages={messages}
        bot={bot}
        userScrolled={userScrolled}
        onScroll={handleScroll}
        onStarterClick={handleStarterClick}
      />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default EmbeddedBotChat;