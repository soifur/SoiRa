import { Bot } from "@/hooks/useBots";

export const createShortBotConfig = (bot: Bot) => {
  if (!bot) {
    throw new Error("Bot configuration is required");
  }

  const minimalConfig = {
    id: bot.id,
    name: bot.name,
    instructions: bot.instructions,
    starters: bot.starters,
    model: bot.model,
    api_key: bot.api_key,
    accessType: bot.accessType || "public",
    open_router_model: bot.open_router_model
  };
  
  return encodeURIComponent(JSON.stringify(minimalConfig));
};