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
      } catch {
        setClientId(Math.random().toString(36).substring(7));
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        if (!botId) return;

        console.log("Fetching shared bot data for botId:", botId);

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
        
        const memory_enabled = sharedBotData.memory_enabled === true;
        console.log("Memory enabled:", memory_enabled);

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

        let instructions = sharedBotData.instructions || "";

        // If quiz mode is enabled, try to get the quiz responses
        if (sharedBotData.quiz_mode === true) {
          console.log("Quiz mode is enabled, fetching quiz responses for client:", clientId);
          
          const { data: quizConfig } = await supabase
            .from('quiz_configurations')
            .select('id')
            .eq('bot_id', sharedBotData.bot_id)
            .maybeSingle();

          if (quizConfig?.id) {
            const { data: quizResponses } = await supabase
              .from('quiz_responses')
              .select('combined_instructions')
              .eq('quiz_id', quizConfig.id)
              .eq('user_id', clientId)
              .maybeSingle();

            if (quizResponses?.combined_instructions) {
              console.log("Found quiz combined instructions:", quizResponses.combined_instructions);
              instructions = quizResponses.combined_instructions;
            } else {
              console.log("No quiz responses found for client:", clientId);
              toast({
                title: "Quiz Required",
                description: "Please complete the quiz before starting the chat.",
                variant: "destructive",
              });
              return;
            }
          }
        }

        console.log("Final instructions being used:", instructions);

        const transformedBot: Bot = {
          id: sharedBotData.bot_id,
          name: sharedBotData.bot_name,
          instructions: instructions,
          starters: sharedBotData.starters || [],
          model: model,
          apiKey: sharedBotData.bot_api_keys?.api_key || "",
          openRouterModel: sharedBotData.open_router_model,
          avatar: avatarUrl,
          accessType: "public",
          memory_enabled: memory_enabled,
        };

        console.log("Final bot configuration:", {
          ...transformedBot,
          apiKey: '[REDACTED]'
        });

        setBot(transformedBot);

      } catch (error) {
        console.error("Error fetching bot data:", error);
        toast({
          title: "Error",
          description: "Failed to load bot data",
          variant: "destructive",
        });
      }
    };

    fetchBotData();
  }, [botId, toast, clientId]);

  if (!bot || !clientId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`Chat with ${bot.name}`}</title>
        <meta name="description" content={`Start a conversation with ${bot.name}`} />
        <meta property="og:title" content={`Chat with ${bot.name}`} />
        <meta property="og:description" content={`Start a conversation with ${bot.name}`} />
        <meta property="og:image" content={bot.avatar} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Chat with ${bot.name}`} />
        <meta name="twitter:description" content={`Start a conversation with ${bot.name}`} />
        <meta name="twitter:image" content={bot.avatar} />
        <link rel="icon" type="image/png" href={bot.avatar} />
      </Helmet>
      <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={botId} />
    </>
  );
};

export default EmbeddedChatContainer;