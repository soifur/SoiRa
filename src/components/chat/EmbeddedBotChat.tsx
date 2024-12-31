import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { createMessage } from "@/utils/messageUtils";
import { EmbeddedChatHeader } from "./embedded/EmbeddedChatHeader";
import { EmbeddedChatMessages } from "./embedded/EmbeddedChatMessages";

const EmbeddedBotChat = () => {
  const { shareKey } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  useEffect(() => {
    if (!shareKey) {
      console.error('Share key is missing');
      return;
    }

    try {
      const storedConfig = localStorage.getItem(`share_${shareKey}`);
      if (!storedConfig) {
        console.error('Share configuration not found for key:', shareKey);
        toast({
          title: "Error",
          description: "This shared chat is no longer available",
          variant: "destructive",
        });
        return;
      }

      const config = JSON.parse(storedConfig);
      console.log("Loaded shared bot config:", config);
      setSelectedBot(config);
    } catch (error) {
      console.error('Error loading bot configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load bot configuration",
        variant: "destructive",
      });
    }
  }, [shareKey, toast]);

  const updateChatHistory = (updatedMessages: typeof messages) => {
    try {
      const history = localStorage.getItem("chatHistory") || "[]";
      let existingHistory = JSON.parse(history);
      
      if (!Array.isArray(existingHistory)) {
        existingHistory = [];
      }
      
      const chatSessionId = `${Date.now()}_${shareKey}_embedded`;
      
      const newRecord = {
        id: chatSessionId,
        botId: selectedBot?.id,
        shareKey: shareKey,
        messages: updatedMessages,
        timestamp: new Date().toISOString(),
        type: 'embedded'
      };
      
      existingHistory.unshift(newRecord);
      const limitedHistory = existingHistory.slice(0, 100);
      
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
      console.log("Embedded chat history updated:", newRecord);
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
    if (!selectedBot || isLoading) return;
    setInput(starter);
    
    const syntheticEvent = {
      preventDefault: () => {},
      target: null,
      currentTarget: null,
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      nativeEvent: new Event('submit'),
      stopPropagation: () => {},
      isPropagationStopped: () => false,
      persist: () => {},
      isDefaultPrevented: () => false,
      type: 'submit'
    } as React.FormEvent<HTMLFormElement>;

    await sendMessage(syntheticEvent);
  };

  const clearChat = () => {
    if (!selectedBot) return;
    setMessages([]);
    
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
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedBot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Bot configuration not found. Please make sure the share link is correct.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <EmbeddedChatHeader bot={selectedBot} onClearChat={clearChat} />
      <EmbeddedChatMessages
        messages={messages}
        bot={selectedBot}
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

export default EmbeddedBotChat;