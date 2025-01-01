import { Button } from "@/components/ui/button";
import { History, Plus } from "lucide-react";
import { Bot } from "@/hooks/useBots";
import { cn } from "@/lib/utils";

interface EmbeddedChatHeaderProps {
  bot: Bot;
  onNewChat: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const EmbeddedChatHeader = ({ 
  onNewChat, 
  onToggleHistory,
  showHistory 
}: EmbeddedChatHeaderProps) => {
  return (
    <div className="flex items-center p-4 bg-card">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleHistory}
        className={cn(
          "h-9 w-9",
          showHistory && "text-primary"
        )}
      >
        <History className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNewChat}
        className="h-9 w-9 ml-2"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};