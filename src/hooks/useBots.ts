import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
  model: "gemini" | "claude" | "openai" | "openrouter";
  apiKey: string;
  openRouterModel?: string;
  avatar?: string;
}

export const useBots = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>(() => {
    try {
      const saved = localStorage.getItem("chatbots");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading bots from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      // Remove old data if needed
      const oldItems = Object.keys(localStorage).filter(key => 
        key.startsWith("dedicated_chat_") || 
        key.startsWith("embedded_chat_") ||
        key.startsWith("public_chat_")
      );
      
      if (oldItems.length > 50) {
        // Keep only the 50 most recent chats
        oldItems
          .sort((a, b) => {
            const timeA = localStorage.getItem(a) ? JSON.parse(localStorage.getItem(a)!)[0]?.timestamp || 0 : 0;
            const timeB = localStorage.getItem(b) ? JSON.parse(localStorage.getItem(b)!)[0]?.timestamp || 0 : 0;
            return timeB - timeA;
          })
          .slice(50)
          .forEach(key => localStorage.removeItem(key));
      }

      // Try to save bots data
      const botsString = JSON.stringify(bots);
      localStorage.setItem("chatbots", botsString);
    } catch (error) {
      console.error("Error saving bots to localStorage:", error);
      
      if (error instanceof Error && error.name === "QuotaExceededError") {
        toast({
          title: "Storage Full",
          description: "Cleaning up old chat data to make space. Some chat history may be lost.",
          variant: "destructive",
        });
        
        // Clear old chat data
        Object.keys(localStorage)
          .filter(key => 
            key.startsWith("dedicated_chat_") || 
            key.startsWith("embedded_chat_") ||
            key.startsWith("public_chat_")
          )
          .forEach(key => localStorage.removeItem(key));
        
        // Try saving again
        try {
          localStorage.setItem("chatbots", JSON.stringify(bots));
        } catch (retryError) {
          toast({
            title: "Error",
            description: "Unable to save bot data. Please delete some bots or clear your browser data.",
            variant: "destructive",
          });
        }
      }
    }
  }, [bots, toast]);

  const saveBot = (bot: Bot) => {
    try {
      const newBots = bot.id
        ? bots.map((b) => (b.id === bot.id ? bot : b))
        : [...bots, { ...bot, id: Date.now().toString() }];
      setBots(newBots);
    } catch (error) {
      console.error("Error saving bot:", error);
      toast({
        title: "Error",
        description: "Failed to save bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteBot = (id: string) => {
    try {
      setBots(bots.filter((b) => b.id !== id));
      // Clean up associated chat data
      localStorage.removeItem(`dedicated_chat_${id}`);
      localStorage.removeItem(`embedded_chat_${id}`);
      localStorage.removeItem(`public_chat_${id}`);
    } catch (error) {
      console.error("Error deleting bot:", error);
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { bots, saveBot, deleteBot };
};