import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSessionToken } from "@/hooks/useSessionToken";
import CookieConsent from "./CookieConsent";
import { EmbeddedChatHeader } from "./EmbeddedChatHeader";
import { EmbeddedChatContent } from "./EmbeddedChatContent";
import { EmbeddedChatHistory } from "./EmbeddedChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Bot } from "../types/chatTypes";
import { useEmbeddedChat } from "@/hooks/useEmbeddedChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface EmbeddedChatUIProps {
  bot: Bot;
  clientId: string;
  shareKey?: string;
}

const EmbeddedChatUI = ({ bot, clientId, shareKey }: EmbeddedChatUIProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const isMobile = useIsMobile();
  const { sessionToken, hasConsent, handleCookieAccept, handleCookieReject } = useSessionToken();
  const { toast } = useToast();
  
  const {
    messages,
    isLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat
  } = useEmbeddedChat(bot, clientId, shareKey, sessionToken);

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

  if (hasConsent === false) {
    return <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />;
  }

  return (
    <>
      <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />
      <Card className="w-full h-[100dvh] overflow-hidden">
        <div className="flex h-full relative">
          <div className={cn(
            "absolute top-0 left-0 h-full z-50 bg-background transition-transform duration-300",
            showHistory ? "translate-x-0" : "-translate-x-full",
            isMobile ? "w-full" : "w-80"
          )}>
            <EmbeddedChatHistory
              sessionToken={sessionToken}
              botId={bot.id}
              onSelectChat={handleSelectChat}
              onNewChat={createNewChat}
              currentChatId={chatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
          <div className="flex-1 flex flex-col h-full">
            <EmbeddedChatHeader
              bot={{...bot, starters: bot.starters || []}}
              onClearChat={handleClearChat}
              onToggleHistory={() => setShowHistory(!showHistory)}
              showHistory={showHistory}
              onNewChat={createNewChat}
            />
            <EmbeddedChatContent
              messages={messages}
              isLoading={isLoading}
              onSend={sendMessage}
              bot={{...bot, starters: bot.starters || []}}
              onStarterClick={sendMessage}
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default EmbeddedChatUI;