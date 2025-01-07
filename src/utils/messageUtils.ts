import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/chat/types/chatTypes';

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
  avatar
});

export const formatMessages = (
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp?: Date }>
): Message[] => {
  return messages.map(msg => ({
    id: uuidv4(),
    ...msg
  }));
};