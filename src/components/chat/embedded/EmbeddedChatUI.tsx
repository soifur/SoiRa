import { useState, useEffect } from "react";
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
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Category } from "@/components/categories/CategoryManagement";

interface EmbeddedChatUIProps {
  bot?: Bot;
  clientId?: string;
  shareKey?: string;
  category?: Category;
  bots?: Bot[];
}

const EmbeddedChatUI = ({ bot, clientId, shareKey, category, bots }: EmbeddedChatUIProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { sessionToken, hasConsent, handleCookieAccept, handleCookieReject } = useSessionToken();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Use either the single bot or the first bot from the array
  const selectedBot = bot || (bots && bots[0]);
  const selectedShareKey = shareKey || (category && category.short_key);
  const selectedClientId = clientId || category?.id;

  // Check if we have the required data
  useEffect(() => {
    if (!selectedBot || !selectedClientId) {
      toast({
        title: "Error",
        description: "Missing required data to initialize chat",
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [selectedBot, selectedClientId]);
  
  const {
    messages,
    isLoading: chatLoading,
    chatId,
    sendMessage,
    loadExistingChat,
    createNewChat,
    clearMessages
  } = useEmbeddedChat(selectedBot, selectedClientId, selectedShareKey, sessionToken);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!hasConsent) {
    return <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Initializing chat...</div>
      </div>
    );
  }

  if (!selectedBot || !selectedClientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Unable to load chat. Please try again later.</div>
      </div>
    );
  }

  const handleSelectChat = (selectedChatId: string) => {
    loadExistingChat(selectedChatId);
    if (isMobile) {
      setShowHistory(false);
    }
  };

  const handleClearChat = async () => {
    try {
      clearMessages();
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

  return (
    <>
      <CookieConsent onAccept={handleCookieAccept} onReject={handleCookieReject} />
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className={cn(
            "fixed top-0 left-0 h-full z-50 bg-background shadow-lg",
            showHistory ? "translate-x-0" : "-translate-x-full",
            isMobile ? "w-full" : "w-80",
            "transition-transform duration-300 ease-in-out"
          )}>
            <EmbeddedChatHistory
              sessionToken={sessionToken}
              botId={selectedBot?.id}
              onSelectChat={handleSelectChat}
              onNewChat={createNewChat}
              currentChatId={chatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
            />
          </div>
          <div className="flex-1 flex flex-col h-full relative w-full">
            <div className="absolute top-0 left-0 right-0 z-40">
              <EmbeddedChatHeader
                bot={selectedBot ? {...selectedBot, starters: selectedBot.starters || []} : null}
                onClearChat={handleClearChat}
                onToggleHistory={() => setShowHistory(!showHistory)}
                showHistory={showHistory}
                onNewChat={handleClearChat}
                isAuthenticated={isAuthenticated}
              />
            </div>
            <div className="flex-1 overflow-hidden mt-16 mb-24">
              <EmbeddedChatContent
                messages={messages}
                isLoading={chatLoading}
                onSend={sendMessage}
                bot={selectedBot ? {...selectedBot, starters: selectedBot.starters || []} : null}
                onStarterClick={sendMessage}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
              {!isAuthenticated && (
                <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between p-2 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Sign in to save your chat history</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Button>
                </div>
              )}
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSend={sendMessage}
                  disabled={chatLoading}
                  isLoading={chatLoading}
                  placeholder="Type your message..."
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default EmbeddedChatUI;