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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    onDelete(e);
  };

  return (
    <div
      className={cn(
        "p-2 rounded-lg cursor-pointer transition-colors group relative",
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isActive ? "bg-accent/50 dark:bg-accent text-foreground" : "bg-card"
      )}
      onClick={onSelect}
    >
      <p className="text-xs line-clamp-2 pr-6">
        {title}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-1 h-5 w-5 transition-opacity",
          "hover:bg-destructive/10 hover:text-destructive",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};