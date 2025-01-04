import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet";

interface EmbeddedChatContainerProps {
  botId?: string;
  categoryId?: string;
}

const EmbeddedChatContainer = ({ botId, categoryId }: EmbeddedChatContainerProps) => {
  const [bot, setBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getClientId = async () => {
      try {
        const { data: { user_ip }, error } = await supabase.functions.invoke('get-client-ip');
        if (error) throw error;
        setClientId(user_ip || Math.random().toString(36).substring(7));
      } catch {
        setClientId(Math.random().toString(36).substring(7));
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        if (!botId) {
          setLoading(false);
          return;
        }

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
          setLoading(false);
          return;
        }

        const validModel = (model: string): model is Bot['model'] => {
          return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
        };

        const model = validModel(sharedBotData.model) ? sharedBotData.model : 'openrouter';
        
        const memory_enabled = sharedBotData.memory_enabled === true;

        let avatarUrl = sharedBotData.avatar;
        
        if (!avatarUrl && sharedBotData.bot_id) {
          const { data: botData } = await supabase
            .from('bots')
            .select('avatar')
            .eq('id', sharedBotData.bot_id)
            .single();
          
          if (botData?.avatar) {
            if (botData.avatar.startsWith('avatars/')) {
              const { data } = supabase
                .storage
                .from('avatars')
                .getPublicUrl(botData.avatar);
              avatarUrl = data.publicUrl;
            } else {
              avatarUrl = botData.avatar;
            }
          }
        }

        if (!avatarUrl) {
          avatarUrl = "/lovable-uploads/5dd98599-640e-42ab-b5f9-51965516a74d.png";
        }

        const transformedBot: Bot = {
          id: sharedBotData.bot_id,
          name: sharedBotData.bot_name,
          instructions: sharedBotData.instructions || "",
          starters: sharedBotData.starters || [],
          model: model,
          apiKey: sharedBotData.bot_api_keys?.api_key || "",
          openRouterModel: sharedBotData.open_router_model,
          avatar: avatarUrl,
          accessType: "public",
          memory_enabled: memory_enabled,
        };

        setBot(transformedBot);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bot data:", error);
        toast({
          title: "Error",
          description: "Failed to load bot data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchBotData();
  }, [botId, toast]);

  if (loading || !clientId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!bot && !categoryId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Bot not found</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Chat with ${bot?.name || 'Bot'}`}</title>
        <meta name="description" content={`Start a conversation with ${bot?.name || 'Bot'}`} />
        <meta property="og:title" content={`Chat with ${bot?.name || 'Bot'}`} />
        <meta property="og:description" content={`Start a conversation with ${bot?.name || 'Bot'}`} />
        {bot?.avatar && <meta property="og:image" content={bot.avatar} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Chat with ${bot?.name || 'Bot'}`} />
        <meta name="twitter:description" content={`Start a conversation with ${bot?.name || 'Bot'}`} />
        {bot?.avatar && <meta name="twitter:image" content={bot.avatar} />}
        {bot?.avatar && <link rel="icon" type="image/png" href={bot.avatar} />}
      </Helmet>
      <EmbeddedChatUI 
        bot={bot} 
        clientId={clientId} 
        shareKey={botId} 
      />
    </>
  );
};

export default EmbeddedChatContainer;