import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
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
        const parsedMessages = JSON.parse(savedMessages);
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

  const updateChatHistory = (updatedMessages: typeof messages) => {
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const newMessages = [
        ...messages,
        { role: "user", content: input, timestamp: new Date() }
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
        { role: "assistant", content: response, timestamp: new Date() }
      ];
      
      setMessages(updatedMessages);
      
      // Save to localStorage with unique bot ID and interface type key
      const chatKey = `dedicated_chat_${bot.id}`;
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      
      // Update chat history with new messages
      updateChatHistory(updatedMessages);
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
          messages={messages}
          selectedBot={bot}
          onStarterClick={setInput}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4">
        <ChatInput
          input={input}
          isLoading={isLoading}
          disabled={false}
          onInputChange={setInput}
          onSubmit={sendMessage}
        />
      </div>
    </Card>
  );
};

export default DedicatedBotChat;