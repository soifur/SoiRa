import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotCategory } from "@/types/categoryTypes";

interface CategoryBadgeProps {
  category: BotCategory;
  onRemove?: () => void;
}

export const CategoryBadge = ({ category, onRemove }: CategoryBadgeProps) => {
  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {category.name}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
};