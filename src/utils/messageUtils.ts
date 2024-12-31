export const createMessage = (role: string, content: string, isBot?: boolean, avatar?: string) => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role,
  content,
  timestamp: new Date(),
  isBot,
  avatar
});

export const formatMessages = (messages: Array<{ role: string; content: string; timestamp?: Date }>) => {
  return messages.map(msg => ({
    ...msg,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }));
};