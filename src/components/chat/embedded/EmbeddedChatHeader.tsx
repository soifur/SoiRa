import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Bot } from "@/hooks/useBots";

interface EmbeddedChatHeaderProps {
  bot: Bot;
  onClearChat: () => void;
}

export const EmbeddedChatHeader = ({ bot, onClearChat }: EmbeddedChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">{bot.name}</h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearChat}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear Chat
      </Button>
    </div>
  );
};