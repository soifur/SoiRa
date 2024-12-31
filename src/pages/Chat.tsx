import { useState } from "react";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useBots } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  const updateChatHistory = async (updatedMessages: typeof messages) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated user");
      }

      const chatData = {
        bot_id: selectedBotId,
        messages: updatedMessages,
        user_id: session.session.user.id
      };

      const { error } = await supabase
        .from('chat_history')
        .insert(chatData);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = (starter: string) => {
    setInput(starter);
    const fakeEvent = new Event('submit') as unknown as React.FormEvent;
    handleMessageSend(fakeEvent);
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      const newMessages = [
        ...messages,
        createMessage("user", input)
      ];
      setMessages(newMessages);
      setInput("");
      await updateChatHistory(newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl pt-20">
      <div className="flex gap-4">
        <div className="flex-1">
          <Card className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="p-4">
              <ChatHeader
                bots={bots}
                selectedBotId={selectedBotId}
                onBotSelect={setSelectedBotId}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={messages}
                starters={[
                  "Tell me about yourself",
                  "What can you help me with?",
                  "How does this work?"
                ]}
                onStarterClick={handleStarterClick}
              />
            </div>
            <div className="p-4">
              <ChatInput
                onSend={() => {}}
                disabled={isLoading}
                isLoading={isLoading}
                placeholder="Type your message..."
                onInputChange={setInput}
                value={input}
                onSubmit={handleMessageSend}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;