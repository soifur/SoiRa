import { History, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bot } from "@/hooks/useBots";
import { cn } from "@/lib/utils";

interface EmbeddedChatHeaderProps {
  bot: Bot;
  onClearChat?: () => void;
  onToggleHistory: () => void;
  onNewChat?: () => void;
  showHistory: boolean;
}

export const EmbeddedChatHeader = ({
  bot,
  onClearChat,
  onToggleHistory,
  onNewChat,
  showHistory,
}: EmbeddedChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleHistory}
        >
          <History className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm">{bot.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {onNewChat && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewChat}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};