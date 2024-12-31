import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";

const EmbeddedBotChat = () => {
  const { botId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = () => {
    if (!userScrolled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setUserScrolled(!isAtBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      const configParam = searchParams.get('config');
      if (!configParam) {
        throw new Error('No bot configuration provided');
      }

      const decodedConfig = JSON.parse(decodeURIComponent(configParam));
      console.log("Decoded bot config:", decodedConfig);
      
      if (!decodedConfig.apiKey) {
        toast({
          title: "Configuration Error",
          description: "API key is missing from the bot configuration. Please check your bot settings.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedBot(decodedConfig);

      const initialMessages = [{
        role: "system",
        content: decodedConfig.instructions,
        timestamp: new Date()
      }];
      setMessages(initialMessages);
    } catch (error) {
      console.error('Error loading bot configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load bot configuration. Please make sure the embed code is correct.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const updateChatHistory = (updatedMessages: typeof messages) => {
    const history = localStorage.getItem("chatHistory") || "[]";
    let existingHistory = JSON.parse(history);
    
    if (!Array.isArray(existingHistory)) {
      existingHistory = [];
    }
    
    const chatSessionId = `${Date.now()}_${selectedBot?.id}_embedded`;
    
    const newRecord = {
      id: chatSessionId,
      botId: selectedBot?.id,
      messages: updatedMessages,
      timestamp: new Date().toISOString(),
      type: 'embedded'
    };
    
    existingHistory.unshift(newRecord);
    const limitedHistory = existingHistory.slice(0, 100);
    
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

  const clearChat = () => {
    if (!selectedBot) return;
    
    const initialMessages = [{
      role: "system",
      content: selectedBot.instructions,
      timestamp: new Date()
    }];
    setMessages(initialMessages);
    setUserScrolled(false);
    
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedBot) return;

    try {
      setIsLoading(true);
      const newMessages = [
        ...messages,
        createMessage("user", input)
      ];
      setMessages(newMessages);
      setInput("");
      setUserScrolled(false);

      let response: string;

      if (selectedBot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, selectedBot);
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
      } else {
        throw new Error("Unsupported model type");
      }

      const updatedMessages = [
        ...newMessages,
        createMessage("assistant", response)
      ];
      
      setMessages(updatedMessages);
      updateChatHistory(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI. Please check your API key configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedBot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Bot configuration not found. Please make sure the embed code is correct.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{selectedBot.name}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>
      <div 
        className="flex-1 overflow-y-auto" 
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <MessageList
          messages={formatMessages(messages)}
          selectedBot={selectedBot}
        />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSend={() => {}}
        disabled={isLoading}
        isLoading={isLoading}
        placeholder="Type your message..."
        onInputChange={setInput}
        onSubmit={sendMessage}
      />
    </div>
  );
};

export default EmbeddedBotChat;