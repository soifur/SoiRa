import { Bot } from "@/components/chat/types/chatTypes";

export const isValidBotModel = (model: string): model is Bot['model'] => {
  return ['gemini', 'claude', 'openai', 'openrouter'].includes(model);
};