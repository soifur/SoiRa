import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";

const EmbeddedChatContainer = () => {
  const { botId } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setClientId(data.ip);
      } catch (error) {
        console.error("Error fetching client IP:", error);
        // Fallback to a random client ID if IP fetch fails
        setClientId(Math.random().toString(36).substring(7));
      }
    };

    const fetchBotData = async () => {
      if (!botId) return;

      try {
        const { data, error } = await supabase
          .from("bots")
          .select("*")
          .eq("id", botId)
          .single();

        if (error) throw error;
        setBot(data as Bot);
      } catch (error) {
        console.error("Error fetching bot:", error);
        toast({
          title: "Error",
          description: "Failed to load bot data",
          variant: "destructive",
        });
      }
    };

    fetchClientId();
    fetchBotData();
  }, [botId, toast]);

  if (!bot || !clientId) {
    return <div>Loading...</div>;
  }

  return <EmbeddedChatUI bot={bot} clientId={clientId} />;
};

export default EmbeddedChatContainer;