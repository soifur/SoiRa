import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";

interface ChatControlsProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const ChatControls = ({ onNewChat, onToggleHistory, showHistory }: ChatControlsProps) => {
  return (
    <>
      {!showHistory && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-dropdown-hover"
            onClick={onToggleHistory}
          >
            <Clock className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-dropdown-hover"
            onClick={onNewChat}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </>
  );
};