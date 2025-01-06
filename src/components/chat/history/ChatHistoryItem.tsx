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
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors group relative", // Increased padding
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isActive ? "bg-accent/50 dark:bg-accent text-foreground" : "bg-card"
      )}
      onClick={onSelect}
    >
      <p className={cn(
        "line-clamp-2 pr-8", // Increased right padding for delete button
        isMobile ? "text-sm" : "text-xs" // Larger text on mobile
      )}>
        {title}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-2", // Adjusted position
          isMobile ? "h-8 w-8" : "h-5 w-5", // Larger button on mobile
          "transition-opacity hover:bg-destructive/10 hover:text-destructive",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleDelete}
      >
        <Trash2 className={cn(
          isMobile ? "h-4 w-4" : "h-3 w-3" // Larger icon on mobile
        )} />
      </Button>
    </div>
  );
};