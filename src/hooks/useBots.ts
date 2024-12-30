import { useState, useEffect } from "react";

export interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
  model: "gemini" | "claude" | "openai";
  apiKey: string;
}

export const useBots = () => {
  const [bots, setBots] = useState<Bot[]>(() => {
    const saved = localStorage.getItem("chatbots");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("chatbots", JSON.stringify(bots));
  }, [bots]);

  const saveBot = (bot: Bot) => {
    const newBots = bot.id
      ? bots.map((b) => (b.id === bot.id ? bot : b))
      : [...bots, { ...bot, id: Date.now().toString() }];
    setBots(newBots);
  };

  const deleteBot = (id: string) => {
    setBots(bots.filter((b) => b.id !== id));
  };

  return { bots, saveBot, deleteBot };
};