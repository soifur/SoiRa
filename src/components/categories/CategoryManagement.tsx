import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryList } from "@/components/categories/CategoryList";
import { ShareDialog } from "@/components/categories/ShareDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  short_key: string | null;
  is_public: boolean;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const { name, description, is_public } = editingCategory;
    const isNew = !editingCategory.id;

    try {
      if (isNew) {
        const { error } = await supabase
          .from('bot_categories')
          .insert({ name, description, is_public });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bot_categories')
          .update({ name, description, is_public })
          .eq('id', editingCategory.id);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Category ${isNew ? 'created' : 'updated'} successfully`,
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bot_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = (field: keyof Category, value: any) => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [field]: value });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard`,
      });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <Button
          onClick={() =>
            setEditingCategory({
              id: "",
              name: "",
              description: "",
              short_key: null,
              is_public: false,
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>

      <CategoryForm
        editingCategory={editingCategory}
        onSave={handleSaveCategory}
        onCancel={() => setEditingCategory(null)}
        onChange={handleCategoryChange}
      />

      <CategoryList
        categories={categories}
        onEdit={setEditingCategory}
        onDelete={handleDeleteCategory}
        onShare={(category) => {
          setSelectedCategory(category);
          setShareDialogOpen(true);
        }}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        category={selectedCategory}
        baseUrl={window.location.origin}
        onCopy={copyToClipboard}
      />
    </div>
  );
};