import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface EmbeddedChatHeaderProps {
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const EmbeddedChatHeader = ({
  onToggleHistory,
  showHistory,
}: EmbeddedChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4">
        <Button
          variant={showHistory ? "default" : "outline"}
          size="default"
          onClick={onToggleHistory}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>
      </div>
    </div>
  );
};