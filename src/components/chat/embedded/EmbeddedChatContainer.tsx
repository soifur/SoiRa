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

        const validModel = (model: string): model is Bot['model'] => {
          return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
        };

        const model = validModel(sharedBotData.model) ? sharedBotData.model : 'openrouter';
        const memory_enabled = sharedBotData.memory_enabled !== false;

        console.log("Raw memory_enabled from DB:", sharedBotData.memory_enabled);
        console.log("Processed memory_enabled:", memory_enabled);

        const avatarUrl = sharedBotData.avatar || 
          `https://ivkasvmrscfbijqiiaeo.supabase.co/storage/v1/object/public/avatars/${sharedBotData.bot_id}.png`;

        const transformedBot: Bot = {
          id: sharedBotData.bot_id,
          name: sharedBotData.bot_name,
          instructions: sharedBotData.instructions || "",
          starters: sharedBotData.starters || [],
          model: model,
          api_key: sharedBotData.bot_api_keys?.api_key || "",
          open_router_model: sharedBotData.open_router_model,
          avatar: avatarUrl,
          accessType: "public",
          memory_enabled: memory_enabled,
          memory_instructions: sharedBotData.memory_instructions || "",
          memory_model: sharedBotData.memory_model || sharedBotData.open_router_model || "anthropic/claude-3-opus",
          memory_api_key: sharedBotData.memory_api_key || sharedBotData.bot_api_keys?.api_key || ""
        };

        console.log("Transformed bot memory settings:", {
          memory_enabled: transformedBot.memory_enabled,
          memory_instructions: transformedBot.memory_instructions,
          memory_model: transformedBot.memory_model,
          raw_memory_enabled: sharedBotData.memory_enabled
        });

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
        <title>{`Chat with ${bot.name}`}</title>
        <meta property="og:title" content={`Chat with ${bot.name}`} />
        <meta property="og:description" content={bot.instructions || `Start a conversation with ${bot.name}`} />
        <meta property="og:image" content={bot.avatar || "/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png"} />
        <meta property="og:type" content="website" />
        <meta name="description" content={bot.instructions || `Start a conversation with ${bot.name}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Chat with ${bot.name}`} />
        <meta name="twitter:description" content={bot.instructions || `Start a conversation with ${bot.name}`} />
        <meta name="twitter:image" content={bot.avatar || "/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png"} />
        <link rel="icon" type="image/png" href={bot.avatar || "/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png"} />
      </Helmet>
      <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={botId} />
    </>
  );
};

export default EmbeddedChatContainer;