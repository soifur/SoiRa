import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ChatHistoryItem = ({
  id,
  title,
  isActive,
  onSelect,
  onDelete,
}: ChatHistoryItemProps) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors group relative",
        "hover:bg-accent",
        isActive ? "bg-accent" : "bg-card"
      )}
      onClick={onSelect}
    >
      <p className="text-sm text-muted-foreground line-clamp-2 pr-8">
        {title}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 transition-opacity",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};