import { useState, useEffect } from "react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatService } from "@/services/ChatService";
import { Database } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EmbeddedChatUIProps {
  bot: Bot;
  clientId: string;
  shareKey?: string;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

const EmbeddedChatUI = ({ bot, clientId, shareKey }: EmbeddedChatUIProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const [chatId, setChatId] = useState<string | null>(null);

  // Load existing chat on mount
  useEffect(() => {
    const loadExistingChat = async () => {
      try {
        if (!bot.id) return;

        const { data: existingChat } = await supabase
          .from('chat_history')
          .select('*')
          .eq('bot_id', bot.id)
          .eq('client_id', clientId)
          .eq('share_key', shareKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingChat) {
          setChatId(existingChat.id);
          // First cast to unknown, then to ChatMessage[]
          const rawMessages = existingChat.messages as unknown;
          const chatMessages = (rawMessages as ChatMessage[]).map((msg: ChatMessage) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: uuidv4()
          }));
          setMessages(chatMessages);
        } else {
          // Create a new chat if none exists
          const newChatId = uuidv4();
          setChatId(newChatId);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    };

    loadExistingChat();
  }, [bot.id, clientId, shareKey]);

  const saveChatHistory = async (updatedMessages: typeof messages) => {
    try {
      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const chatData = {
        id: chatId || uuidv4(),
        bot_id: bot.id,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        client_id: clientId,
        share_key: shareKey,
        sequence_number: (latestChat?.sequence_number || 0) + 1
      } as Database['public']['Tables']['chat_history']['Insert'];

      if (chatId) {
        // Update existing chat
        const { error } = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', chatId);

        if (error) throw error;
      } else {
        // Insert new chat
        const { error } = await supabase
          .from('chat_history')
          .insert(chatData);

        if (error) throw error;
        setChatId(chatData.id);
      }
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
    await sendMessage(starter);
  };

  const handleClearChat = async () => {
    try {
      setMessages([]);
      // Generate a new chat ID for the next conversation
      const newChatId = uuidv4();
      setChatId(newChatId);
      
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
    if (!message.trim()) return;

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
        botResponse = await ChatService.sendGeminiMessage(newMessages, bot);
      } else if (bot.model === "openrouter") {
        botResponse = await ChatService.sendOpenRouterMessage(newMessages, bot);
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages);
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
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearChat}
          className="hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5 text-destructive" />
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