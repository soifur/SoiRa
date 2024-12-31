import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { useToast } from "@/components/ui/use-toast";

const EmbeddedChatContainer = () => {
  const { shareKey } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Get client IP for identification
    const getClientId = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setClientId(data.ip);
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

  if (!bot || !clientId) {
    return <div>Loading...</div>;
  }

  return <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={shareKey} />;
};

export default EmbeddedChatContainer;