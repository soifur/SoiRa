import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

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
        setClientId(Math.random().toString(36).substring(7));
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        if (!botId) return;

        const { data: sharedBot, error: sharedBotError } = await supabase
          .from("shared_bots")
          .select(`
            *,
            bot_api_keys!shared_bots_api_key_id_fkey (
              api_key
            ),
            bots!inner (
              avatar
            )
          `)
          .eq("short_key", botId)
          .maybeSingle();

        if (sharedBotError) throw sharedBotError;
        
        if (!sharedBot) {
          toast({
            title: "Error",
            description: "Bot not found or sharing has expired",
            variant: "destructive",
          });
          return;
        }

        const validModel = (model: string): model is Bot['model'] => {
          return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
        };

        const model = validModel(sharedBot.model) ? sharedBot.model : 'gemini';

        const transformedBot: Bot = {
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: model,
          apiKey: sharedBot.bot_api_keys?.api_key || "",
          openRouterModel: sharedBot.open_router_model,
          avatar: sharedBot.bots?.avatar,
          accessType: "public"
        };

        console.log("Fetched fresh bot data:", transformedBot);
        setBot(transformedBot);

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

  return (
    <>
      <Helmet>
        <title>{bot.name}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={`Chat with ${bot.name}`} />
      </Helmet>
      <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={botId} />
    </>
  );
};

export default EmbeddedChatContainer;