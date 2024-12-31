import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useBots } from "@/hooks/useBots";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { useLocation } from "react-router-dom";
import { createMessage, formatMessages } from "@/utils/messageUtils";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const location = useLocation();
  const urlBotId = new URLSearchParams(location.search).get('bot');
  const isEmbedded = urlBotId !== null;

  useEffect(() => {
    if (urlBotId) {
      const botExists = bots.some(bot => bot.id === urlBotId);
      if (botExists) {
        setSelectedBotId(urlBotId);
      } else {
        console.error('Embedded bot ID not found:', urlBotId);
        toast({
          title: "Error",
          description: "The specified chatbot could not be found.",
          variant: "destructive",
        });
      }
    }
  }, [urlBotId, bots, toast]);

  const selectedBot = bots.find((bot) => bot.id === selectedBotId);

  const saveChatToHistory = (chatMessages: typeof messages) => {
    const history = localStorage.getItem("chatHistory") || "[]";
    let existingHistory = JSON.parse(history);
    
    if (!Array.isArray(existingHistory)) {
      existingHistory = [];
    }
    
    const newRecord = {
      botId: selectedBotId,
      messages: chatMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
      })),
      timestamp: new Date().toISOString()
    };
    
    existingHistory.unshift(newRecord);
    const limitedHistory = existingHistory.slice(0, 100);
    
    try {
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving to chat history:', error);
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
      saveChatToHistory(updatedMessages);
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
            <ChatHeader
              bots={bots}
              selectedBotId={selectedBotId}
              onBotSelect={setSelectedBotId}
            />
            <MessageList
              messages={formatMessages(messages)}
              selectedBot={selectedBot}
              onStarterClick={setInput}
            />
            <ChatInput
              onSend={() => {}}
              disabled={!selectedBot}
              isLoading={isLoading}
              placeholder="Type your message..."
              onInputChange={setInput}
              onSubmit={sendMessage}
            />
          </div>
        </div>
        <div className="w-80">
          <ChatHistory
            messages={messages}
            selectedBot={selectedBot}
            onLoadChat={loadChat}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
