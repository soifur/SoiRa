import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: Date;
  isBot?: boolean;
  avatar?: string;
}

export const createMessage = (role: string, content: string, isBot?: boolean, avatar?: string): Message => ({
  id: uuidv4(),
  role,
  content,
  timestamp: new Date(),
  isBot,
  avatar
});

export const formatMessages = (messages: Array<{ role: string; content: string; timestamp?: Date }>): Message[] => {
  return messages.map(msg => ({
    id: uuidv4(),
    ...msg,
    isBot: msg.role === 'assistant'
  }));
};