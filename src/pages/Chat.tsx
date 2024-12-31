import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const selectedBot = bots.find((bot) => bot.id === selectedBotId);

  const updateChatHistory = (updatedMessages: typeof messages) => {
    const history = localStorage.getItem("chatHistory") || "[]";
    let existingHistory = JSON.parse(history);
    
    if (!Array.isArray(existingHistory)) {
      existingHistory = [];
    }
    
    const chatSessionId = Date.now().toString();
    
    const newRecord = {
      id: chatSessionId,
      botId: selectedBot?.id || 'public',
      messages: updatedMessages,
      timestamp: new Date().toISOString()
    };
    
    existingHistory.unshift(newRecord);
    const limitedHistory = existingHistory.slice(0, 100);
    
    try {
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
      // Also save to public chat storage if no bot is selected
      if (!selectedBot) {
        localStorage.setItem(`public_chat_${chatSessionId}`, JSON.stringify(updatedMessages));
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

  const loadChat = (chatMessages: Array<{ role: string; content: string }>) => {
    setMessages(chatMessages);
  };

  return (
    <div className="container mx-auto max-w-6xl pt-20">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
            <MessageList
              messages={formatMessages(messages)}
              selectedBot={selectedBot}
              onStarterClick={setInput}
            />
            <ChatInput
              onSend={sendMessage}
              disabled={!selectedBot}
              isLoading={isLoading}
              placeholder="Type your message..."
              onInputChange={setInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
