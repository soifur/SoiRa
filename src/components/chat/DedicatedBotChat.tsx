import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string; avatar?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => uuidv4());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatKey = `chat_${bot.id}_${chatId}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          avatar: msg.role === "assistant" ? (msg.avatar || bot.avatar) : undefined
        })));
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [bot.id, chatId, bot.avatar]);

  const clearChat = () => {
    setMessages([]);
    const chatKey = `chat_${bot.id}_${chatId}`;
    localStorage.removeItem(chatKey);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);

      // Add temporary streaming message
      const streamingMessage = createMessage("assistant", "", true, bot.avatar);
      setMessages([...newMessages, streamingMessage]);
      setIsStreaming(true);

      let response: string = "";

      if (bot.model === "openrouter") {
        await ChatService.sendOpenRouterMessage(
          newMessages,
          bot,
          undefined,
          (chunk: string) => {
            response += chunk;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: response }
                ];
              }
              return prev;
            });
          }
        );
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
        // For Gemini, update the message all at once since it doesn't support streaming
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: response }
            ];
          }
          return prev;
        });
      } else {
        throw new Error("Unsupported model type");
      }

      // Get the next sequence number
      const { data: chatData } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (chatData?.sequence_number || 0) + 1;

      // Save to Supabase with avatar URL and sequence number
      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: chatId,
          bot_id: bot.id,
          messages: [...newMessages, { ...streamingMessage, content: response }].map(msg => ({
            ...msg,
            timestamp: msg.timestamp?.toISOString(),
          })),
          avatar_url: bot.avatar,
          sequence_number: nextSequenceNumber,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving chat history:", error);
        throw error;
      }

      // Save to localStorage
      const chatKey = `chat_${bot.id}_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify([...newMessages, { ...streamingMessage, content: response }]));

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4 bg-card">
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={formatMessages(messages)}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={sendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </Card>
  );
};

export default DedicatedBotChat;