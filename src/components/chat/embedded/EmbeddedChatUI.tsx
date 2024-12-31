import { useState, useEffect } from "react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatService } from "@/services/ChatService";

interface EmbeddedChatUIProps {
  bot: Bot;
  clientId: string;
  shareKey?: string;
}

const EmbeddedChatUI = ({ bot, clientId, shareKey }: EmbeddedChatUIProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const updateChatHistory = async (updatedMessages: typeof messages) => {
    try {
      const { data: existingChat, error: fetchError } = await supabase
        .from('chat_history')
        .select('id')
        .eq('bot_id', bot.id)
        .eq('client_id', clientId)
        .eq('share_key', shareKey)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const chatData = {
        bot_id: bot.id,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        client_id: clientId,
        share_key: shareKey
      };

      let result;
      if (existingChat) {
        result = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', existingChat.id);
      } else {
        result = await supabase
          .from('chat_history')
          .insert(chatData);
      }

      if (result.error) throw result.error;
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = (starter: string) => {
    setInput(starter);
    handleMessageSend(new Event('submit') as unknown as React.FormEvent);
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = createMessage("user", input);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      
      let botResponse = "";
      if (bot.model === "gemini") {
        botResponse = await ChatService.sendGeminiMessage(newMessages, bot);
      } else if (bot.model === "openrouter") {
        botResponse = await ChatService.sendOpenRouterMessage(newMessages, bot);
      }

      const botMessage = createMessage("assistant", botResponse);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      await updateChatHistory(updatedMessages);
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

  return (
    <Card className="flex flex-col h-[calc(100vh-2rem)] mx-auto max-w-4xl">
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={handleStarterClick}
        />
      </div>
      <div className="p-4">
        <ChatInput
          onSend={() => {}}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
          onInputChange={setInput}
          value={input}
          onSubmit={handleMessageSend}
        />
      </div>
    </Card>
  );
};

export default EmbeddedChatUI;