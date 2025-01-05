import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/components/ui/use-toast";

const Categories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { categories } = useCategories();
  const { toast } = useToast();

  return (
    <div className="container py-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Categories;