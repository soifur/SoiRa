import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmbeddedChatUI } from "./EmbeddedChatUI";

const EmbeddedChatContainer = () => {
  const { botId } = useParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  useEffect(() => {
    const fetchBotConfig = async () => {
      if (!botId) {
        setError('No bot ID provided');
        return;
      }

      try {
        console.log("Fetching bot config for ID:", botId);
        
        const { data: sharedBot, error: fetchError } = await supabase
          .from('shared_bots')
          .select(`
            *,
            bot_api_keys!inner (
              api_key
            )
          `)
          .eq('short_key', botId)
          .single();

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          throw fetchError;
        }

        if (!sharedBot) {
          console.log('No bot configuration found for ID:', botId);
          throw new Error('Bot configuration not found');
        }

        console.log("Loaded shared bot config:", sharedBot);
        
        const botConfig: Bot = {
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: sharedBot.model as "gemini" | "claude" | "openai" | "openrouter",
          apiKey: sharedBot.bot_api_keys.api_key,
          openRouterModel: sharedBot.open_router_model,
        };

        setSelectedBot(botConfig);
        setError(null);
      } catch (error) {
        console.error('Error loading bot configuration:', error);
        setError('Bot configuration not found. Please make sure the share link is correct.');
      }
    };

    fetchBotConfig();
  }, [botId, toast]);

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
    return null;
  }

  return <EmbeddedChatUI bot={selectedBot} />;
};

export default EmbeddedChatContainer;