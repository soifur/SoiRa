import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { useBots } from "@/hooks/useBots";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const EmbeddedBotChat = () => {
  const { botId } = useParams();
  const { bots } = useBots();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedBot = bots.find((bot) => bot.id === botId);

  useEffect(() => {
    if (!selectedBot) {
      console.error('Bot not found:', botId);
      toast({
        title: "Error",
        description: "Bot not found. Please make sure the bot ID is correct.",
        variant: "destructive",
      });
      return;
    }

    // Initialize chat with bot's instructions as system message
    const initialMessages = [{
      role: "system",
      content: selectedBot.instructions,
      timestamp: new Date()
    }];
    setMessages(initialMessages);

  }, [selectedBot, botId, toast]);

  const clearChat = () => {
    if (!selectedBot) return;
    
    // Reset to initial state with just the system message
    const initialMessages = [{
      role: "system",
      content: selectedBot.instructions,
      timestamp: new Date()
    }];
    setMessages(initialMessages);
    
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
        <p className="text-red-500">Bot not found. Please make sure the bot ID is correct.</p>
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
      <MessageList
        messages={messages.filter(msg => msg.role !== 'system')}
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