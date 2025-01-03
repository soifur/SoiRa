import { Bot } from "@/components/chat/types/chatTypes";

export const isValidBotModel = (model: string | undefined): model is Bot['model'] => {
  return model !== undefined && ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
};