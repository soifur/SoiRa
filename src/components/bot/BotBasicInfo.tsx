import React from "react";
import { Input } from "@/components/ui/input";
import { AvatarUploader } from "../AvatarUploader";
import { Bot } from "@/hooks/useBots";

interface BotBasicInfoProps {
  bot: Bot;
  onBotChange: (updates: Partial<Bot>) => void;
}

export const BotBasicInfo = ({ bot, onBotChange }: BotBasicInfoProps) => {
  return (
    <div className="flex items-center gap-4">
      <AvatarUploader 
        avatar={bot.avatar}
        onAvatarChange={(avatar) => onBotChange({ avatar })}
      />
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={bot.name}
          onChange={(e) => onBotChange({ name: e.target.value })}
          placeholder="Bot name"
          className="dark:bg-[#1e1e1e] dark:border-gray-700"
        />
      </div>
    </div>
  );
};