import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedChatContainer } from "./embedded/EmbeddedChatContainer";
import { useEmbeddedChatState } from "./embedded/EmbeddedChatState";

export const EmbeddedBotChat = () => {
  const { shareKey } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadBotConfig = async () => {
      if (!shareKey) return;

      try {
        const { data: sharedBot, error: sharedBotError } = await supabase
          .from('shared_bots')
          .select(`
            *,
            bot_api_keys (
              api_key
            )
          `)
          .eq('share_key', shareKey)
          .single();

        if (sharedBotError) throw sharedBotError;

        const botConfig: Bot = {
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: sharedBot.model as "gemini" | "claude" | "openai" | "openrouter",
          apiKey: sharedBot.bot_api_keys?.api_key || "",
          openRouterModel: sharedBot.open_router_model,
        };

        setBot(botConfig);
      } catch (error) {
        console.error("Error loading bot configuration:", error);
        toast({
          title: "Error",
          description: "Failed to load bot configuration",
          variant: "destructive",
        });
      }
    };

    loadBotConfig();
  }, [shareKey, toast]);

  const {
    messages,
    isLoading,
    userScrolled,
    setUserScrolled,
    handleSend,
    handleClearChat,
    handleStarterClick,
  } = useEmbeddedChatState(bot as Bot, shareKey);

  if (!bot) {
    return null;
  }

  return (
    <EmbeddedChatContainer
      bot={bot}
      messages={messages}
      userScrolled={userScrolled}
      isLoading={isLoading}
      onScroll={() => setUserScrolled(true)}
      onSend={handleSend}
      onClearChat={handleClearChat}
      onStarterClick={handleStarterClick}
    />
  );
};

export default EmbeddedBotChat;