import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";
import { supabase } from "@/integrations/supabase/client";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatKey = `dedicated_chat_${bot.id}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]); // Reset messages for new bot
    }
  }, [bot.id]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`dedicated_chat_${bot.id}`);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const updateChatHistory = async (updatedMessages: typeof messages) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated user");
      }

      const chatData = {
        bot_id: bot.id,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        user_id: session.session.user.id
      };

      // First try to find existing chat history for this bot and user
      const { data: existingChat, error: fetchError } = await supabase
        .from('chat_history')
        .select('id')
        .eq('bot_id', bot.id)
        .eq('user_id', session.session.user.id)
        .is('share_key', null)  // Make sure we're not updating a shared chat
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching existing chat:", fetchError);
        throw fetchError;
      }

      let error;
      if (existingChat) {
        // Update existing chat
        ({ error } = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', existingChat.id));
      } else {
        // Insert new chat
        ({ error } = await supabase
          .from('chat_history')
          .insert(chatData));
      }

      if (error) throw error;
      
      console.log("Chat history saved successfully");
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);

      let response: string;

      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, bot);
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
      } else {
        throw new Error("Unsupported model type");
      }

      const botResponse = createMessage("assistant", response, true, bot.avatar);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      await updateChatHistory(updatedMessages);
      
      const chatKey = `dedicated_chat_${bot.id}`;
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
    <Card className="flex flex-col h-full bg-card">
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={formatMessages(messages)}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={sendMessage}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-[5px]">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </Card>
  );
};

export default DedicatedBotChat;
