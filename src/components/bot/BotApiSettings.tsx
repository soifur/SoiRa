import React from "react";
import { Input } from "@/components/ui/input";

interface BotApiSettingsProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

export const BotApiSettings = ({ apiKey, onApiKeyChange }: BotApiSettingsProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">API Key</label>
      <Input
        type="password"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="Enter your API key"
        className="dark:bg-[#1e1e1e] dark:border-gray-700"
      />
    </div>
  );
};