import { useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { useBots } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { createMessage, formatMessages } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { bots } = useBots();
  const { toast } = useToast();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const selectedBot = bots.find((bot) => bot.id === selectedBotId);

  const updateChatHistory = (updatedMessages: typeof messages) => {
    try {
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
        timestamp: new Date().toISOString(),
        type: 'public'
      };
      
      existingHistory.unshift(newRecord);
      const limitedHistory = existingHistory.slice(0, 100);
      
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

  const handleMessageSend = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);

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

  const handleStarterClick = (starter: string) => {
    handleMessageSend(starter);
  };

  return (
    <div className="container mx-auto max-w-6xl pt-20">
      <div className="flex gap-4">
        <div className="flex-1">
          <Card className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={formatMessages(messages)}
                selectedBot={selectedBot}
                onStarterClick={handleStarterClick}
              />
            </div>
            <div className="p-4">
              <ChatInput
                onSend={handleMessageSend}
                disabled={isLoading}
                isLoading={isLoading}
                placeholder="Type your message..."
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;