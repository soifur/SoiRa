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
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useQuizInstructions } from "@/hooks/useQuizInstructions";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string; avatar?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => uuidv4());
  const { combinedInstructions } = useQuizInstructions(bot.id, bot.quiz_mode);

  // Temporarily override bot instructions when quiz mode is enabled
  const modifiedBot = {
    ...bot,
    instructions: bot.quiz_mode ? combinedInstructions || bot.instructions : bot.instructions
  };

  console.log("Bot state:", {
    originalInstructions: bot.instructions,
    quizMode: bot.quiz_mode,
    combinedInstructions,
    finalInstructions: modifiedBot.instructions
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Add temporary streaming message
      const streamingMessage = createMessage("assistant", "", true, modifiedBot.avatar);
      setMessages([...newMessages, streamingMessage]);
      setIsStreaming(true);

      let response: string = "";
      
      console.log("Using instructions:", modifiedBot.instructions, 
                  "Quiz mode:", modifiedBot.quiz_mode, 
                  "Combined instructions:", combinedInstructions,
                  "Original instructions:", bot.instructions);

      if (modifiedBot.model === "openrouter") {
        await ChatService.sendOpenRouterMessage(
          newMessages,
          modifiedBot,
          undefined,
          (chunk: string) => {
            response += chunk;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: response }
                ];
              }
              return prev;
            });
          }
        );
      } else if (modifiedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, modifiedBot);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: response }
            ];
          }
          return prev;
        });
      }

      // Get the next sequence number
      const { data: chatData } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (chatData?.sequence_number || 0) + 1;

      // Save to Supabase with avatar URL and sequence number
      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: chatId,
          bot_id: bot.id,
          messages: [...newMessages, { ...streamingMessage, content: response }].map(msg => ({
            ...msg,
            timestamp: msg.timestamp?.toISOString(),
          })),
          avatar_url: bot.avatar,
          sequence_number: nextSequenceNumber,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving chat history:", error);
        throw error;
      }

      // Save to localStorage
      const chatKey = `chat_${bot.id}_${chatId}`;
      localStorage.setItem(chatKey, JSON.stringify([...newMessages, { ...streamingMessage, content: response }]));

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4 bg-card">
      <div className="flex justify-end mb-4">
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
          selectedBot={modifiedBot}
          starters={modifiedBot.starters}
          onStarterClick={sendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4">
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
