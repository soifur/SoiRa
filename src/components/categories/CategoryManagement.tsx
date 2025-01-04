import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryList } from "@/components/categories/CategoryList";
import { ShareDialog } from "@/components/categories/ShareDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  short_key: string | null;
  is_public: boolean;
  bots?: Bot[];
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableBots, setAvailableBots] = useState<Bot[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedBots = data.map((bot): Bot => ({
        id: bot.id,
        name: bot.name,
        instructions: bot.instructions || "",
        starters: bot.starters || [],
        model: bot.model,
        apiKey: bot.api_key,
        openRouterModel: bot.open_router_model,
        avatar: bot.avatar,
        accessType: "private",
        memory_enabled: bot.memory_enabled,
      }));

      setAvailableBots(transformedBots);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bots",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories with their assigned bots
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('bot_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesError) throw categoriesError;

      // Fetch bot assignments for all categories
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('bot_category_assignments')
        .select('category_id, bot_id');

      if (assignmentsError) throw assignmentsError;

      // Create a map of category IDs to their assigned bot IDs
      const categoryBotMap = new Map();
      assignmentsData.forEach((assignment) => {
        const botIds = categoryBotMap.get(assignment.category_id) || [];
        botIds.push(assignment.bot_id);
        categoryBotMap.set(assignment.category_id, botIds);
      });

      // Transform categories data with assigned bots
      const categoriesWithBots = categoriesData.map((category) => ({
        ...category,
        bots: availableBots.filter((bot) => 
          categoryBotMap.get(category.id)?.includes(bot.id)
        ),
      }));

      setCategories(categoriesWithBots);
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

    const { name, description, is_public, bots = [] } = editingCategory;
    const isNew = !editingCategory.id;

    try {
      let categoryId = editingCategory.id;

      if (isNew) {
        const { data, error } = await supabase
          .from('bot_categories')
          .insert({ name, description, is_public })
          .select()
          .single();

        if (error) throw error;
        categoryId = data.id;
      } else {
        const { error } = await supabase
          .from('bot_categories')
          .update({ name, description, is_public })
          .eq('id', categoryId);

        if (error) throw error;
      }

      // Handle bot assignments
      if (categoryId) {
        // First, remove existing assignments
        await supabase
          .from('bot_category_assignments')
          .delete()
          .eq('category_id', categoryId);

        // Then, add new assignments
        if (bots.length > 0) {
          const assignments = bots.map((bot) => ({
            category_id: categoryId,
            bot_id: bot.id,
          }));

          const { error: assignmentError } = await supabase
            .from('bot_category_assignments')
            .insert(assignments);

          if (assignmentError) throw assignmentError;
        }
      }

      toast({
        title: "Success",
        description: `Category ${isNew ? 'created' : 'updated'} successfully`,
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      // Delete bot assignments first
      await supabase
        .from('bot_category_assignments')
        .delete()
        .eq('category_id', id);

      // Then delete the category
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

  const handleBotAssignment = (bots: Bot[]) => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, bots });
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
              bots: [],
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
        availableBots={availableBots}
        onBotsChange={handleBotAssignment}
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