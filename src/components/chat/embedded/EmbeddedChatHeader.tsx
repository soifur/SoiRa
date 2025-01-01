import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { Bot } from "@/hooks/useBots";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmbeddedChatHeaderProps {
  bot: Bot;
  onClearChat: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const EmbeddedChatHeader = ({ 
  bot, 
  onClearChat, 
  onToggleHistory,
  showHistory 
}: EmbeddedChatHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-center p-4 bg-card">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHistory}
          className={showHistory ? "text-primary" : ""}
        >
          <History className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{bot.name}</h2>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearChat}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};