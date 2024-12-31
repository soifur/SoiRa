import { Bot } from "@/hooks/useBots";

export const createShortBotConfig = (bot: Bot) => {
  const minimalConfig = {
    id: bot.id,
    name: bot.name,
    model: bot.model,
    apiKey: bot.apiKey,
    starters: bot.starters,
    accessType: bot.accessType || "public"
  };
  
  return encodeURIComponent(JSON.stringify(minimalConfig));
};