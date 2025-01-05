import { History, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHistoryHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

export const ChatHistoryHeader = ({ onNewChat, onClose }: ChatHistoryHeaderProps) => {
  return (
    <div className="flex-none p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <span className="font-semibold">Chat History</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewChat}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};