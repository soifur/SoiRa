import { useState, useRef, useEffect } from "react";
import { Message } from "@/components/chat/MessageList";
import { Bot } from "@/hooks/useBots";
import { v4 as uuidv4 } from 'uuid';

export const useChatState = (bot: Bot) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(() => uuidv4());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatKey = `chat_${bot.id}_${chatId}`;
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          avatar: msg.role === "assistant" ? (msg.avatar || bot.avatar) : undefined
        })));
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        setMessages([]);
      }
    }
  }, [bot.id, chatId, bot.avatar]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isStreaming,
    setIsStreaming,
    messagesEndRef,
    chatId
  };
};