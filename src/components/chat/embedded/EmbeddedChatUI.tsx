import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { createMessage } from "@/utils/messageUtils";
import { EmbeddedChatHeader } from "./EmbeddedChatHeader";
import { EmbeddedChatMessages } from "./EmbeddedChatMessages";
import { supabase } from "@/integrations/supabase/client";

interface EmbeddedChatUIProps {
  bot: Bot;
}

export const EmbeddedChatUI = ({ bot }: EmbeddedChatUIProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const updateChatHistory = async (newMessages: typeof messages) => {
    try {
      const { data: { user_ip } } = await supabase.functions.invoke('get-client-ip');
      
      const chatData = {
        bot_id: bot.id,
        messages: newMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        client_id: user_ip,
        share_key: bot.id
      };

      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData, {
          onConflict: 'bot_id,client_id,share_key'
        });

      if (error) throw error;
      
      console.log("Chat history saved successfully");
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = async (starter: string) => {
    if (isLoading) return;
    setInput(starter);
    await sendMessage(new Event('submit') as any);
  };

  const sendMessage = async (e: React.FormEvent | Event) => {
    if (e instanceof Event && 'preventDefault' in e) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const newMessages = [
        ...messages,
        createMessage("user", input)
      ];
      setMessages(newMessages);
      setInput("");

      let response: string;

      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, bot);
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
      } else {
        throw new Error("Unsupported model type");
      }

      const updatedMessages = [
        ...newMessages,
        createMessage("assistant", response)
      ];
      
      setMessages(updatedMessages);
      await updateChatHistory(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col gap-4 p-4 max-w-3xl mx-auto">
      <EmbeddedChatHeader bot={bot} onClearChat={clearChat} />
      <EmbeddedChatMessages
        messages={messages}
        bot={bot}
        userScrolled={false}
        onScroll={() => {}}
        onStarterClick={handleStarterClick}
      />
      <ChatInput
        onSend={() => {}}
        disabled={isLoading}
        isLoading={isLoading}
        placeholder="Type your message..."
        onInputChange={setInput}
        value={input}
        onSubmit={sendMessage}
      />
    </div>
  );
};