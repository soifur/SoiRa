import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BotPublishToggleProps {
  isPublished: boolean;
  onPublishChange: (published: boolean) => void;
}

export const BotPublishToggle = ({ isPublished, onPublishChange }: BotPublishToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="publish-mode"
        checked={isPublished}
        onCheckedChange={onPublishChange}
        className="dark:bg-gray-700 dark:data-[state=checked]:bg-primary"
      />
      <Label htmlFor="publish-mode">Enable Publishing</Label>
    </div>
  );
};