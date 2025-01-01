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

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; avatar?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => uuidv4());

  useEffect(() => {
    const chatKey = `chat_${bot.id}_${chatId}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    }
  }, [bot.id, chatId]);

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

      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let response: string;

      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, bot);
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
      } else {
        throw new Error("Unsupported model type");
      }

      const botResponse = createMessage("assistant", response, true, bot.avatar);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      
      const chatKey = `chat_${bot.id}_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

      // Save to Supabase with avatar URL
      await ChatService.saveChatHistory(chatId, bot.id, updatedMessages, bot.avatar);
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
        <div className="flex-1 overflow-y-auto pb-8">
          <MessageList
            messages={formatMessages(messages)}
            selectedBot={bot}
            starters={bot.starters}
            onStarterClick={sendMessage}
            isLoading={isLoading}
          />
          <div ref={messagesEndRef} />
        </div>
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