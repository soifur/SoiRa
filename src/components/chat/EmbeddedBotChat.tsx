import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { createMessage } from "@/utils/messageUtils";
import { EmbeddedChatHeader } from "./embedded/EmbeddedChatHeader";
import { EmbeddedChatMessages } from "./embedded/EmbeddedChatMessages";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EmbeddedBotChat = () => {
  const { botId } = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  useEffect(() => {
    const fetchBotConfig = async () => {
      if (!botId) {
        setError('No bot ID provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching bot config for ID:", botId);
        
        const { data, error: fetchError } = await supabase
          .from('shared_bots')
          .select('*')
          .eq('share_key', botId)
          .maybeSingle();

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.log('No bot configuration found for ID:', botId);
          throw new Error('Bot configuration not found');
        }

        console.log("Loaded shared bot config:", data);
        
        const botConfig: Bot = {
          id: data.bot_id,
          name: data.bot_name,
          instructions: data.instructions || "",
          starters: data.starters || [],
          model: data.model as "gemini" | "claude" | "openai" | "openrouter",
          apiKey: "", // API key is not shared for security
          openRouterModel: data.open_router_model,
        };

        setSelectedBot(botConfig);
        setError(null);
      } catch (error) {
        console.error('Error loading bot configuration:', error);
        setError('Bot configuration not found. Please make sure the share link is correct.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotConfig();
  }, [botId, toast]);

  const handleStarterClick = async (starter: string) => {
    if (!selectedBot || isLoading) return;
    setInput(starter);
    await sendMessage(new Event('submit') as any);
  };

  const clearChat = () => {
    if (!selectedBot) return;
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const sendMessage = async (e: React.FormEvent | Event) => {
    if (e instanceof Event && 'preventDefault' in e) {
      e.preventDefault();
    }
    
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading bot configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedBot) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Invalid bot configuration</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <EmbeddedChatHeader bot={selectedBot} onClearChat={clearChat} />
      <EmbeddedChatMessages
        messages={messages}
        bot={selectedBot}
        userScrolled={false}
        onScroll={() => {}}
        onStarterClick={handleStarterClick}
      />
      <ChatInput
        onSend={() => {}}
        disabled={isLoading}
        isLoading={isLoading}
        placeholder="Type your message..."
        onInputChange={setInput}
        value={input}
        onSubmit={sendMessage}
      />
    </div>
  );
};

export default EmbeddedBotChat;