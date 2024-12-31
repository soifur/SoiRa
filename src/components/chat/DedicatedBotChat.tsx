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

interface Message {
  role: string;
  content: string;
  timestamp?: Date;
}

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatKey = `dedicated_chat_${bot.id}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]); // Reset messages for new bot
    }
  }, [bot.id]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`dedicated_chat_${bot.id}`);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const updateChatHistory = (updatedMessages: Message[]) => {
    const history = localStorage.getItem("chatHistory") || "[]";
    let existingHistory = JSON.parse(history);
    
    // Ensure existingHistory is an array
    if (!Array.isArray(existingHistory)) {
      existingHistory = [];
    }
    
    // Create a unique identifier for this chat session
    const chatSessionId = Date.now().toString();
    
    // Add new chat record
    const newRecord = {
      id: chatSessionId,
      botId: bot.id,
      messages: updatedMessages,
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array to show newest first
    existingHistory.unshift(newRecord);
    
    // Limit history to prevent localStorage from getting too full
    const limitedHistory = existingHistory.slice(0, 100);
    
    // Save back to localStorage
    try {
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);

      let response: string;

      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, bot);
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
      } else if (bot.model === "openai") {
        response = await ChatService.sendOpenAIMessage(newMessages, bot);
      } else if (bot.model === "claude") {
        response = await ChatService.sendClaudeMessage(newMessages, bot);
      } else {
        throw new Error("Unsupported model type");
      }

      const botResponse = createMessage("assistant", response, true, bot.avatar);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      updateChatHistory(updatedMessages);
      
      const chatKey = `dedicated_chat_${bot.id}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
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
        <MessageList
          messages={formatMessages(messages)}
          selectedBot={bot}
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