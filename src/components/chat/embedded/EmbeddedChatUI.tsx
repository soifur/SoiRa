import { useState, useEffect } from "react";
import { MessageList } from "../MessageList";
import { ChatInput } from "../ChatInput";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatHistoryService } from "@/services/ChatHistoryService";
import { ChatService } from "@/services/ChatService";
import { ChatMessage } from "../types/chatTypes";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import CookieConsent from "./CookieConsent";
import { useSessionToken } from "@/hooks/useSessionToken";

interface EmbeddedChatUIProps {
  bot: Bot;
  clientId: string;
  shareKey?: string;
}

const EmbeddedChatUI = ({ bot, clientId, shareKey }: EmbeddedChatUIProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const [chatId, setChatId] = useState<string | null>(null);
  const { sessionToken, hasConsent, handleCookieAccept, handleCookieReject } = useSessionToken();

  useEffect(() => {
    const loadExistingChat = async () => {
      if (!bot.id || !sessionToken) return;

      try {
        const { data: existingChat, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('bot_id', bot.id)
          .eq('session_token', sessionToken)
          .eq('share_key', shareKey)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.log("No existing chat found, creating new one");
          await createNewChat();
          return;
        }

        if (existingChat) {
          console.log("Found existing chat for session:", sessionToken);
          setChatId(existingChat.id);
          const rawMessages = existingChat.messages as unknown;
          const chatMessages = (rawMessages as ChatMessage[]).map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: msg.id || uuidv4()
          }));
          setMessages(chatMessages);
        } else {
          await createNewChat();
        }
      } catch (error) {
        console.error("Error loading chat:", error);
        await createNewChat();
      }
    };

    if (sessionToken) {
      loadExistingChat();
    }
  }, [bot.id, sessionToken, shareKey]);

  const createNewChat = async () => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      setMessages([]);
      await ChatHistoryService.createNewChatHistory(newChatId, bot.id, clientId, shareKey, sessionToken);
      return newChatId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleClearChat = async () => {
    try {
      console.log("Starting new chat creation process");
      const newChatId = await createNewChat();
      if (newChatId) {
        toast({
          title: "Success",
          description: "Started a new chat",
        });
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
    }
  };

  const handleStarterClick = (starter: string) => {
    if (!isLoading && hasConsent) {
      sendMessage(starter);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionToken) return;

    try {
      setIsLoading(true);
      
      if (!chatId) {
        const newChatId = await createNewChat();
        if (!newChatId) return;
      }

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      
      const loadingMessage = createMessage("assistant", "...", true, bot.avatar);
      setMessages([...newMessages, loadingMessage]);

      let botResponse = "";
      if (bot.model === "gemini") {
        console.log("Sending message to Gemini API");
        botResponse = await ChatService.sendGeminiMessage(newMessages, bot);
      } else if (bot.model === "openrouter") {
        console.log("Sending message to OpenRouter API");
        botResponse = await ChatService.sendOpenRouterMessage(newMessages, bot);
      }

      const botMessage = createMessage("assistant", botResponse, true, bot.avatar);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      const messagesToSave = updatedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString()
      }));

      await ChatHistoryService.updateChatHistory(chatId!, bot.id, messagesToSave, clientId, shareKey, sessionToken);
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

  if (hasConsent === false) {
    return <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />;
  }

  return (
    <>
      <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />
      <Card className="flex flex-col h-[100dvh] w-full mx-auto max-w-4xl">
        <div className="sticky top-0 z-10 p-2 border-b bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-primary ml-auto flex"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="ml-2">New Chat</span>
          </Button>
        </div>
        
        {/* Added pt-14 to ensure content starts below the sticky header on mobile */}
        <div className="flex-1 overflow-hidden relative mb-[76px] pt-14">
          <MessageList
            messages={messages}
            selectedBot={bot}
            starters={bot.starters || []}
            onStarterClick={handleStarterClick}
            isLoading={isLoading}
          />
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-background">
          <div className="h-[1px] bg-muted/20 border-t" />
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading || !hasConsent}
              isLoading={isLoading}
              placeholder={hasConsent === null ? "Accepting cookies..." : "Type your message..."}
              onInputChange={setInput}
              value={input}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default EmbeddedChatUI;