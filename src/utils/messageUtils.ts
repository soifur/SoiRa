import { v4 as uuidv4 } from 'uuid';
import { Message, BotSettings } from '@/components/chat/types/chatTypes';

export const createMessage = (
  role: "user" | "assistant",
  content: string,
  isBot?: boolean,
  avatar?: string
): Message => ({
  id: uuidv4(),
  role,
  content,
  timestamp: new Date(),
  isBot,
  avatar
});

export const formatMessages = (messages: Array<{ role: "user" | "assistant"; content: string; timestamp?: Date }>): Message[] => {
  return messages.map(msg => ({
    id: uuidv4(),
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    isBot: msg.role === "assistant"
  }));
};

export const parseBotSettings = (sharedBot: any): BotSettings => {
  console.log('Parsing bot settings from:', sharedBot);
  return {
    temperature: sharedBot.temperature ?? 1,
    top_p: sharedBot.top_p ?? 1,
    frequency_penalty: sharedBot.frequency_penalty ?? 0,
    presence_penalty: sharedBot.presence_penalty ?? 0,
    max_tokens: sharedBot.max_tokens ?? 4096,
    stream: sharedBot.stream ?? true,
    response_format: typeof sharedBot.response_format === 'string' 
      ? JSON.parse(sharedBot.response_format) 
      : sharedBot.response_format || { type: "text" },
    tool_config: typeof sharedBot.tool_config === 'string' 
      ? JSON.parse(sharedBot.tool_config) 
      : sharedBot.tool_config || [],
    system_templates: typeof sharedBot.system_templates === 'string' 
      ? JSON.parse(sharedBot.system_templates) 
      : sharedBot.system_templates || [],
    memory_enabled: sharedBot.memory_enabled ?? false,
    memory_enabled_model: sharedBot.memory_enabled_model ?? false
  };
};