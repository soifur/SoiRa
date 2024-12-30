import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useBots } from "@/hooks/useBots";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { ChatHistory } from "@/components/chat/ChatHistory";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  const selectedBot = bots.find((bot) => bot.id === selectedBotId);

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

      setMessages([
        ...newMessages,
        { role: "assistant", content: response, timestamp: new Date() }
      ]);
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
          <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <ChatHeader
              bots={bots}
              selectedBotId={selectedBotId}
              onBotSelect={setSelectedBotId}
              embedCode={selectedBot ? `<iframe src="${window.location.origin}/chat?bot=${selectedBot.id}" />` : ""}
            />
            <MessageList
              messages={messages}
              selectedBot={selectedBot}
              onStarterClick={setInput}
            />
            <ChatInput
              input={input}
              isLoading={isLoading}
              disabled={!selectedBot}
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