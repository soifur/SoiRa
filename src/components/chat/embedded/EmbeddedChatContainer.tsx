import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmbeddedChatUI from "./EmbeddedChatUI";
import type { Bot } from "../types/chatTypes";

const EmbeddedChatContainer = () => {
  const { shortKey } = useParams();
  const [bot, setBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    const fetchBot = async () => {
      if (!shortKey) return;

      const { data: sharedBot, error } = await supabase
        .from("shared_bots")
        .select("*")
        .eq("short_key", shortKey)
        .single();

      if (error) {
        console.error("Error fetching bot:", error);
        return;
      }

      if (sharedBot) {
        setBot({
          id: sharedBot.bot_id,
          name: sharedBot.bot_name,
          instructions: sharedBot.instructions || "",
          starters: sharedBot.starters || [],
          model: sharedBot.model as Bot["model"],
          open_router_model: sharedBot.open_router_model,
          avatar: sharedBot.avatar,
          voice_enabled: sharedBot.voice_enabled || false,
          memory_enabled: sharedBot.memory_enabled || false,
        });
      }
    };

    const getClientId = async () => {
      const response = await fetch("/_functions/get-client-ip");
      const data = await response.json();
      setClientId(data.ip);
    };

    fetchBot();
    getClientId();
  }, [shortKey]);

  if (!bot || !clientId) {
    return <div>Loading...</div>;
  }

  return <EmbeddedChatUI bot={bot} clientId={clientId} shareKey={shortKey} />;
};

export default EmbeddedChatContainer;