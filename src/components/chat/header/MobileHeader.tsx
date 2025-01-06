import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotSelector } from "./BotSelector";
import { Bot } from "@/hooks/useBots";

interface MobileHeaderProps {
  onToggleHistory: () => void;
  selectedBotId: string | null;
  setSelectedBotId?: (id: string) => void;
  uniqueBots: Bot[];
  onNewChat?: () => void;
}

export const MobileHeader = ({
  onToggleHistory,
  selectedBotId,
  setSelectedBotId,
  uniqueBots,
  onNewChat,
}: MobileHeaderProps) => {
  if (!selectedBotId || !setSelectedBotId) return null;

  return (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-dropdown-hover"
        onClick={onToggleHistory}
      >
        <Clock className="h-4 w-4" />
      </Button>

      <BotSelector
        selectedBotId={selectedBotId}
        setSelectedBotId={setSelectedBotId}
        uniqueBots={uniqueBots}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-dropdown-hover"
        onClick={onNewChat}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};