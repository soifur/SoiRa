import { useState } from "react";
import { Card } from "@/components/ui/card";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { ChatHistoryService } from "@/services/ChatHistoryService";
import { ChatService } from "@/services/ChatService";
import { v4 as uuidv4 } from 'uuid';
import CookieConsent from "./CookieConsent";
import { useSessionToken } from "@/hooks/useSessionToken";
import { ChatLayout } from "./ChatLayout";
import { EmbeddedChatHeader } from "./EmbeddedChatHeader";
import { EmbeddedChatContent } from "./EmbeddedChatContent";
import { EmbeddedChatHistory } from "./EmbeddedChatHistory";

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
  const [showHistory, setShowHistory] = useState(false);

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

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleStarterClick = (starter: string) => {
    if (!isLoading && hasConsent) {
      sendMessage(starter);
    }
  };

  const handleLoadChat = (chatMessages: Array<{ role: string; content: string }>) => {
    setMessages(chatMessages.map(msg => ({
      ...msg,
      id: uuidv4(),
      timestamp: new Date()
    })));
    setShowHistory(false);
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
      <Card className="w-full h-[100dvh] overflow-hidden">
        <div className="flex flex-col h-full relative">
          <EmbeddedChatHeader 
            onToggleHistory={handleToggleHistory}
            showHistory={showHistory}
          />
          <ChatLayout onNewChat={handleClearChat}>
            {{
              messages: (
                <>
                  <EmbeddedChatHistory
                    messages={messages}
                    bot={bot}
                    onLoadChat={handleLoadChat}
                    show={showHistory}
                  />
                  <EmbeddedChatContent
                    messages={messages}
                    bot={bot}
                    isLoading={isLoading}
                    hasConsent={hasConsent}
                    input={input}
                    onInputChange={setInput}
                    onSend={sendMessage}
                    onStarterClick={handleStarterClick}
                  />
                </>
              ),
              input: null
            }}
          </ChatLayout>
        </div>
      </Card>
    </>
  );
};

export default EmbeddedChatUI;
