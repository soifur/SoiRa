import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BotPublishToggleProps {
  published: boolean;
  onPublishedChange: (published: boolean) => void;
}

export const BotPublishToggle = ({ published, onPublishedChange }: BotPublishToggleProps) => {
  return (
    <div className="flex items-center space-x-2 py-2">
      <Switch
        id="publish-mode"
        checked={published}
        onCheckedChange={onPublishedChange}
        className="dark:bg-gray-700 dark:data-[state=checked]:bg-primary"
      />
      <Label htmlFor="publish-mode">Enable Publishing</Label>
    </div>
  );
};