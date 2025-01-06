import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: (e: React.MouseEvent) => void;
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors group relative",
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isActive ? "bg-accent/50 dark:bg-accent text-foreground" : "bg-card"
      )}
      onClick={handleClick}
    >
      <p className="text-sm line-clamp-2 pr-8">
        {title}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6 transition-opacity",
          "hover:bg-destructive/10 hover:text-destructive",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};