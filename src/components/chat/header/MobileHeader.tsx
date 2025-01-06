import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { BotSelector } from "./BotSelector";
import { Bot as BotType } from "@/hooks/useBots";

interface MobileHeaderProps {
  isChat: boolean;
  showHistory: boolean;
  onToggleHistory: () => void;
  selectedBotId: string | null;
  setSelectedBotId: (id: string) => void;
  bots?: BotType[];
  onNewChat?: () => void;
}

export const MobileHeader = ({
  isChat,
  showHistory,
  onToggleHistory,
  selectedBotId,
  setSelectedBotId,
  bots,
  onNewChat,
}: MobileHeaderProps) => {
  if (!isChat) return null;

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

      {selectedBotId && setSelectedBotId && (
        <BotSelector
          selectedBotId={selectedBotId}
          setSelectedBotId={setSelectedBotId}
          bots={bots || []}
        />
      )}

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