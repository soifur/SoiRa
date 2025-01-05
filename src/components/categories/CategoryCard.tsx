import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Trash } from "lucide-react";
import { BotCategory } from "@/types/categoryTypes";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/components/ui/use-toast";

interface CategoryCardProps {
  category: BotCategory;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const { deleteCategory } = useCategories();
  const { toast } = useToast();

  const handleShare = () => {
    if (!category.short_key) {
      toast({
        title: "Error",
        description: "This category cannot be shared",
        variant: "destructive",
      });
      return;
    }

    const embedCode = `<iframe
      src="${window.location.origin}/embed/category/${category.short_key}"
      width="100%"
      height="600px"
      frameborder="0"
    ></iframe>`;

    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Success",
      description: "Embed code copied to clipboard",
    });
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {category.description || "No description provided"}
        </p>
      </CardContent>
    </Card>
  );
};