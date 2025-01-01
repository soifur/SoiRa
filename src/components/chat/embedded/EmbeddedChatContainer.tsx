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

        // First, get the shared bot data
        const { data: sharedBotData, error: sharedBotError } = await supabase
          .from("shared_bots")
          .select(`
            *,
            bot_api_keys (
              api_key
            )
          `)
          .eq("short_key", botId)
          .maybeSingle();

        if (sharedBotError) throw sharedBotError;
        
        if (!sharedBotData) {
          toast({
            title: "Error",
            description: "Bot not found or sharing has expired",
            variant: "destructive",
          });
          return;
        }

        // Get the bot's avatar from the bots table
        const { data: botData } = await supabase
          .from("bots")
          .select("avatar")
          .eq("id", sharedBotData.bot_id)
          .maybeSingle();

        const validModel = (model: string): model is Bot['model'] => {
          return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
        };

        const model = validModel(sharedBotData.model) ? sharedBotData.model : 'gemini';

        // Get the public URL for the avatar if it exists
        let avatarUrl = botData?.avatar;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          const { data } = await supabase.storage
            .from('avatars')
            .getPublicUrl(avatarUrl);
          avatarUrl = data.publicUrl;
        }

        const transformedBot: Bot = {
          id: sharedBotData.bot_id,
          name: sharedBotData.bot_name,
          instructions: sharedBotData.instructions || "",
          starters: sharedBotData.starters || [],
          model: model,
          apiKey: sharedBotData.bot_api_keys?.api_key || "",
          openRouterModel: sharedBotData.open_router_model,
          avatar: avatarUrl || "/placeholder.svg",
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
        <link rel="icon" href="/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png" />
        <meta name="description" content={`Chat with ${bot.name}`} />
      </Helmet>
      <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={botId} />
    </>
  );
};

export default EmbeddedChatContainer;