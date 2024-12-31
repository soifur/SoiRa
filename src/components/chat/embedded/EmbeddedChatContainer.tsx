import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { useToast } from "@/components/ui/use-toast";

const EmbeddedChatContainer = () => {
  const { botId } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const getClientId = async () => {
      try {
        const { data: { user_ip }, error } = await supabase.functions.invoke('get-client-ip');
        if (error) throw error;
        setClientId(user_ip || Math.random().toString(36).substring(7));
      } catch (error) {
        console.error("Error fetching client IP:", error);
        // Fallback to a random ID if IP fetch fails
        setClientId(Math.random().toString(36).substring(7));
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        if (!botId) return;

        // First fetch the shared bot data using the short_key
        const { data: sharedBot, error: sharedBotError } = await supabase
          .from("shared_bots")
          .select(`
            *,
            bot_api_keys(api_key)
          `)
          .eq("short_key", botId)
          .single();

        if (sharedBotError) throw sharedBotError;
        
        if (!sharedBot) {
          toast({
            title: "Error",
            description: "Bot not found or sharing has expired",
            variant: "destructive",
          });
          return;
        }

        // Validate that the model is one of the allowed types
        const validModel = (model: string): model is Bot['model'] => {
          return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
        };

        const model = validModel(sharedBot.model) ? sharedBot.model : 'gemini';

        // Transform the data to match our Bot interface
        setBot({
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: model,
          apiKey: sharedBot.bot_api_keys?.api_key || "",
          openRouterModel: sharedBot.open_router_model,
          accessType: "public"
        });

      } catch (error) {
        console.error("Error fetching bot:", error);
        toast({
          title: "Error",
          description: "Failed to load bot data",
          variant: "destructive",
        });
      }
    };

    fetchBotData();
  }, [botId, toast]);

  if (!bot || !clientId) {
    return <div>Loading...</div>;
  }

  return <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={botId} />;
};

export default EmbeddedChatContainer;