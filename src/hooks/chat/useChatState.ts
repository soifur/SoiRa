import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { v4 as uuidv4 } from 'uuid';

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const createNewChat = async (sessionToken: string | null) => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      setMessages([]);
      return newChatId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return null;
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatId,
    setChatId,
    createNewChat
  };
};