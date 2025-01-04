import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Edit2, Trash2 } from "lucide-react";
import { Category } from "./CategoryManagement";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onShare: (category: Category) => void;
}

export const CategoryList = ({
  categories,
  onEdit,
  onDelete,
  onShare,
}: CategoryListProps) => {
  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              {category.is_public && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                  Public
                </span>
              )}
              {category.bots && category.bots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {category.bots.map((bot) => (
                    <Badge key={bot.id} variant="secondary">
                      {bot.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {category.short_key && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare(category)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};