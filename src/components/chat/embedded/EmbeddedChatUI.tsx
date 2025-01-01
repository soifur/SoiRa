import { useState, useEffect } from "react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatService } from "@/services/ChatService";
import { ChatHistoryService } from "@/services/ChatHistoryService";
import { ChatMessage } from "../types/chatTypes";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

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
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingChat = async () => {
      try {
        if (!bot.id) return;
        console.log("Loading existing chat for bot:", bot.id, "clientId:", clientId);

        const { data: existingChat } = await supabase
          .from('chat_history')
          .select('*')
          .eq('bot_id', bot.id)
          .eq('client_id', clientId)
          .eq('share_key', shareKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log("Existing chat data:", existingChat);

        if (existingChat) {
          setChatId(existingChat.id);
          const rawMessages = existingChat.messages as unknown;
          const chatMessages = (rawMessages as ChatMessage[]).map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: uuidv4()
          }));
          setMessages(chatMessages);
        } else {
          console.log("No existing chat found, creating new chat");
          const newChatId = uuidv4();
          setChatId(newChatId);
          await ChatHistoryService.createNewChatHistory(newChatId, bot.id, clientId, shareKey);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    };

    loadExistingChat();
  }, [bot.id, clientId, shareKey]);

  const handleStarterClick = async (starter: string) => {
    await sendMessage(starter);
  };

  const handleClearChat = async () => {
    try {
      console.log("Clearing chat and creating new chat history");
      setMessages([]);
      const newChatId = uuidv4();
      console.log("New chat ID:", newChatId);
      
      // Delete old chat history first
      if (chatId) {
        const { error: deleteError } = await supabase
          .from('chat_history')
          .delete()
          .eq('id', chatId);
        
        if (deleteError) {
          console.error("Error deleting old chat:", deleteError);
        }
      }

      setChatId(newChatId);
      await ChatHistoryService.createNewChatHistory(newChatId, bot.id, clientId, shareKey);
      
      toast({
        title: "Success",
        description: "Chat history cleared",
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !chatId) return;

    try {
      setIsLoading(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API");
        botResponse = await ChatService.sendGeminiMessage(newMessages, bot);
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API");
        botResponse = await ChatService.sendOpenRouterMessage(newMessages, bot);
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      // Convert messages to the correct format before saving
      const messagesToSave = updatedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString()
      }));

      await ChatHistoryService.updateChatHistory(chatId, bot.id, messagesToSave, clientId, shareKey);
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
      <div className="p-2 border-b flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearChat}
          className="text-muted-foreground hover:text-primary"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="ml-2">New Chat</span>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters || []}
          onStarterClick={handleStarterClick}
          isLoading={isLoading}
        />
      </div>
      <div className="p-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
          onInputChange={setInput}
          value={input}
        />
      </div>
    </Card>
  );
};

export default EmbeddedChatUI;