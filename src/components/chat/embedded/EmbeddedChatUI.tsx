import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatService } from "@/services/ChatService";
import { createMessage } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { useSessionToken } from "@/hooks/useSessionToken";
import CookieConsent from "./CookieConsent";
import { EmbeddedChatHeader } from "./EmbeddedChatHeader";
import { EmbeddedChatContent } from "./EmbeddedChatContent";
import { EmbeddedChatHistory } from "./EmbeddedChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface EmbeddedChatUIProps {
  bot: Bot;
  clientId: string;
  shareKey?: string;
}

const EmbeddedChatUI = ({ bot, clientId, shareKey }: EmbeddedChatUIProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const { sessionToken, hasConsent, handleCookieAccept, handleCookieReject } = useSessionToken();
  const [showHistory, setShowHistory] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (sessionToken) {
      loadExistingChat();
    }
  }, [sessionToken, bot.id]);

  const loadExistingChat = async (specificChatId?: string) => {
    if (!bot.id || !sessionToken) return;

    try {
      const query = supabase
        .from('chat_history')
        .select('*')
        .eq('bot_id', bot.id)
        .eq('session_token', sessionToken)
        .eq('deleted', 'no');

      if (specificChatId) {
        query.eq('id', specificChatId);
      } else {
        query.order('created_at', { ascending: false }).limit(1);
      }

      const { data: existingChat, error } = await query.single();

      if (error && !specificChatId) {
        console.log("No existing chat found, creating new one");
        await createNewChat();
        return;
      }

      if (existingChat) {
        console.log("Found existing chat for session:", sessionToken);
        setChatId(existingChat.id);
        const chatMessages = existingChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          id: msg.id || uuidv4()
        }));
        setMessages(chatMessages);
      } else if (!specificChatId) {
        await createNewChat();
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      if (!specificChatId) {
        await createNewChat();
      }
    }
  };

  const createNewChat = async () => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      setMessages([]);

      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequence = (latestChat?.sequence_number || 0) + 1;

      const { error } = await supabase
        .from('chat_history')
        .insert({
          id: newChatId,
          bot_id: bot.id,
          messages: [],
          client_id: clientId,
          share_key: shareKey,
          session_token: sessionToken,
          sequence_number: nextSequence
        });

      if (error) throw error;
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
    if (!chatId || !sessionToken) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .update({ deleted: 'yes' })
        .eq('id', chatId)
        .eq('session_token', sessionToken);

      if (error) throw error;

      const newChatId = await createNewChat();
      if (newChatId) {
        toast({
          title: "Success",
          description: "Started a new chat",
        });
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat",
        variant: "destructive",
      });
    }
  };

  const handleSelectChat = (selectedChatId: string) => {
    loadExistingChat(selectedChatId);
    if (isMobile) {
      setShowHistory(false);
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

      const { error } = await supabase
        .from('chat_history')
        .update({
          messages: messagesToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('session_token', sessionToken);

      if (error) throw error;
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
        <div className="flex h-full">
          <EmbeddedChatHistory
            sessionToken={sessionToken}
            botId={bot.id}
            onSelectChat={handleSelectChat}
            onNewChat={createNewChat}
            currentChatId={chatId}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
          <div className={cn(
            "flex flex-col",
            showHistory && !isMobile ? "w-[calc(100%-20rem)]" : "w-full"
          )}>
            <EmbeddedChatHeader
              bot={bot}
              onClearChat={handleClearChat}
              onToggleHistory={() => setShowHistory(!showHistory)}
              showHistory={showHistory}
            />
            <EmbeddedChatContent
              messages={messages}
              isLoading={isLoading}
              onSend={sendMessage}
              bot={bot}
              onStarterClick={sendMessage}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default EmbeddedChatUI;