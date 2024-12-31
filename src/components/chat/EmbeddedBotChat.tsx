import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { useBots } from "@/hooks/useBots";

const EmbeddedBotChat = () => {
  const { botId } = useParams();
  const { bots } = useBots();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedBot = bots.find((bot) => bot.id === botId);

  // Load chat history specific to this bot
  useEffect(() => {
    if (selectedBot) {
      const chatKey = `chat_history_${selectedBot.id}`;
      const savedMessages = localStorage.getItem(chatKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    }
  }, [selectedBot]);

  if (!selectedBot) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Bot not found. Please make sure the bot ID is correct.</p>
      </div>
    );
  }

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

      if (selectedBot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, selectedBot);
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
      } else {
        throw new Error("Unsupported model type");
      }

      const updatedMessages = [
        ...newMessages,
        { role: "assistant", content: response, timestamp: new Date() }
      ];
      
      setMessages(updatedMessages);
      
      // Save to localStorage with unique bot ID
      const chatKey = `chat_history_${selectedBot.id}`;
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
    <div className="flex h-screen flex-col gap-4 p-4">
      <MessageList
        messages={messages}
        selectedBot={selectedBot}
        onStarterClick={setInput}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        disabled={false}
        onInputChange={setInput}
        onSubmit={sendMessage}
      />
    </div>
  );
};

export default EmbeddedBotChat;