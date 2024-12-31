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
    apiKey: bot.apiKey,
    accessType: bot.accessType || "public",
    openRouterModel: bot.openRouterModel
  };
  
  return encodeURIComponent(JSON.stringify(minimalConfig));
};