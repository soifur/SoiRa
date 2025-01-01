import { useState, useEffect } from "react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatHistoryService } from "@/services/ChatHistoryService";
import { ChatService } from "@/services/ChatService";
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
          console.log("Found existing chat, setting chat ID:", existingChat.id);
          setChatId(existingChat.id);
          const rawMessages = existingChat.messages as unknown;
          const chatMessages = (rawMessages as ChatMessage[]).map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: uuidv4()
          }));
          setMessages(chatMessages);
        } else {
          await createNewChat();
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        await createNewChat();
      }
    };

    loadExistingChat();
  }, [bot.id, clientId, shareKey]);

  const createNewChat = async () => {
    try {
      console.log("Creating new chat");
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      setMessages([]);
      await ChatHistoryService.createNewChatHistory(newChatId, bot.id, clientId, shareKey);
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

  const handleClearChat = async () => {
    try {
      console.log("Starting new chat creation process");
      const newChatId = await createNewChat();
      if (newChatId) {
        toast({
          title: "Success",
          description: "Started a new chat",
        });
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = (starter: string) => {
    if (!isLoading) {
      sendMessage(starter);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      
      // Create a new chat if there isn't one
      if (!chatId) {
        const newChatId = await createNewChat();
        if (!newChatId) return;
      }

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

      await ChatHistoryService.updateChatHistory(chatId!, bot.id, messagesToSave, clientId, shareKey);
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
      
      {/* Added spacing container */}
      <div className="h-[2%] bg-muted/20 border-t border-b" />
      
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