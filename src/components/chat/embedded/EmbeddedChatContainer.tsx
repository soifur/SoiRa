import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { EmbeddedChatUI } from "./EmbeddedChatUI";
import { useToast } from "@/components/ui/use-toast";

const EmbeddedChatContainer = () => {
  const { shareKey } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        if (!shareKey) return;

        const { data, error } = await supabase
          .from("bots")
          .select("*")
          .eq("id", shareKey)
          .single();

        if (error) throw error;
        
        setBot({
          id: data.id,
          name: data.name,
          instructions: data.instructions || "",
          starters: data.starters || [],
          model: data.model,
          apiKey: data.api_key,
          openRouterModel: data.open_router_model,
          avatar: data.avatar,
          accessType: "private"
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
  }, [shareKey, toast]);

  if (!bot) {
    return <div>Loading...</div>;
  }

  return <EmbeddedChatUI bot={bot} />;
};

export default EmbeddedChatContainer;