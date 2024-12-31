import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

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

  // Load chat history specific to this bot
  useEffect(() => {
    const history = localStorage.getItem("chatHistory");
    if (history) {
      const allHistory = JSON.parse(history);
      const botHistory = allHistory.find((h: any) => h.botId === bot.id);
      if (botHistory) {
        setMessages(botHistory.messages);
      } else {
        setMessages([]); // Reset messages if no history found for this bot
      }
    }
  }, [bot.id]); // Reset messages when bot changes

  const handleEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${bot.id}" width="100%" height="600px" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "The embed code has been copied to your clipboard",
    });
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
      
      // Save to localStorage with bot ID
      const history = localStorage.getItem("chatHistory");
      const existingHistory = history ? JSON.parse(history) : [];
      const newHistory = existingHistory.filter((h: any) => h.botId !== bot.id);
      newHistory.push({
        botId: bot.id,
        messages: updatedMessages,
      });
      localStorage.setItem("chatHistory", JSON.stringify(newHistory));
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
        <Button variant="outline" onClick={handleEmbed}>
          <Code className="mr-2 h-4 w-4" />
          Embed
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