import { useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { useBots } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const selectedBot = bots.find((bot) => bot.id === selectedBotId);

  const updateChatHistory = (updatedMessages: typeof messages, type: 'public' | 'bot' = 'public') => {
    const history = localStorage.getItem("chatHistory") || "[]";
    let existingHistory = JSON.parse(history);
    
    if (!Array.isArray(existingHistory)) {
      existingHistory = [];
    }
    
    const chatSessionId = `${Date.now()}_${type === 'public' ? 'public' : selectedBot?.id}`;
    
    const newRecord = {
      id: chatSessionId,
      botId: type === 'public' ? 'public' : selectedBot?.id,
      messages: updatedMessages,
      timestamp: new Date().toISOString(),
      type: type
    };
    
    existingHistory.unshift(newRecord);
    const limitedHistory = existingHistory.slice(0, 100);
    
    try {
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleMessageSend = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);
      setInput(""); // Clear input

      let response: string;

      if (selectedBot) {
        if (selectedBot.model === "openrouter") {
          response = await ChatService.sendOpenRouterMessage(newMessages, selectedBot);
        } else if (selectedBot.model === "gemini") {
          response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
        } else {
          throw new Error("Unsupported model type");
        }
      } else {
        response = "This is a public chat. Messages are saved but not processed by AI.";
      }

      const botResponse = createMessage("assistant", response);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      updateChatHistory(updatedMessages, selectedBot ? 'bot' : 'public');
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl pt-20">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
            <MessageList
              messages={formatMessages(messages)}
              selectedBot={selectedBot}
              onStarterClick={handleMessageSend}
            />
            <ChatInput
              onSend={handleMessageSend}
              disabled={isLoading}
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