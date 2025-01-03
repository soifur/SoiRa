import { useState } from "react";
import { Message } from "@/components/chat/types/chatTypes";
import { Bot } from "@/components/chat/types/chatTypes";
import { ChatService } from "@/services/ChatService";
import { useMemoryContext } from "./memory/useMemoryContext";
import { v4 as uuidv4 } from 'uuid';

export const useMessageHandling = (
  bot: Bot,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  userContext: any,
  updateUserContext: (context: any) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addContextToMessage, updateMemoryFromResponse } = useMemoryContext();
  const abortController = new AbortController();

  const sendMessage = async (message: string) => {
    if (!message.trim() || !bot) return;

    try {
      setIsLoading(true);
      console.log("Starting to send message");

      // Create and add user message
      const userMessage = {
        id: uuidv4(),
        role: "user",
        content: message,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Add context to message if available
      const messageWithContext = await addContextToMessage(message, userContext);
      console.log("Adding context to message:", messageWithContext);

      // Prepare messages for API
      const messagesToSend = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      if (bot.instructions) {
        messagesToSend.unshift({
          role: "system",
          content: bot.instructions
        });
      }

      console.log("Sending message to API with context:", messagesToSend);

      // Send message to API
      let response;
      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(
          messagesToSend,
          bot,
          abortController.signal
        );
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(
          messagesToSend,
          bot
        );
      } else {
        throw new Error("Unsupported model type");
      }

      if (!response) throw new Error("No response received from API");

      // Create and add bot message
      const botMessage = {
        id: uuidv4(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Update memory context in background
      updateMemoryFromResponse(response, userContext).catch(console.error);

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in sendMessage:", error);
        // Add error message to chat
        const errorMessage = {
          id: uuidv4(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date()
        };
        setMessages([...messages, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      console.log("Message handling completed");
    }
  };

  return {
    isLoading,
    sendMessage
  };
};