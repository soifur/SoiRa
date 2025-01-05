import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BotCategory, CategoryAssignment } from "@/types/categoryTypes";

export const useCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BotCategory[]>([]);
  const [assignments, setAssignments] = useState<CategoryAssignment[]>([]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_category_assignments')
        .select('*');

      if (error) throw error;
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching category assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch category assignments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAssignments();
  }, []);

  const saveCategory = async (category: Partial<BotCategory>) => {
    try {
      let result;
      if (category.id) {
        result = await supabase
          .from('bot_categories')
          .update({
            name: category.name,
            description: category.description,
            is_public: category.is_public,
          })
          .eq('id', category.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('bot_categories')
          .insert({
            name: category.name,
            description: category.description,
            is_public: category.is_public || false,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      await fetchCategories();
      return result.data;
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bot_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
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

  const assignBotToCategory = async (botId: string, categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('bot_category_assignments')
        .insert({
          bot_id: botId,
          category_id: categoryId,
        })
        .select()
        .single();

      if (error) throw error;

      setAssignments([...assignments, data]);
      toast({
        title: "Success",
        description: "Bot assigned to category",
      });
    } catch (error) {
      console.error("Error assigning bot to category:", error);
      toast({
        title: "Error",
        description: "Failed to assign bot to category",
        variant: "destructive",
      });
    }
  };

  const removeBotFromCategory = async (botId: string, categoryId: string) => {
    try {
      const { error } = await supabase
        .from('bot_category_assignments')
        .delete()
        .match({ bot_id: botId, category_id: categoryId });

      if (error) throw error;

      setAssignments(assignments.filter(
        a => !(a.bot_id === botId && a.category_id === categoryId)
      ));
      toast({
        title: "Success",
        description: "Bot removed from category",
      });
    } catch (error) {
      console.error("Error removing bot from category:", error);
      toast({
        title: "Error",
        description: "Failed to remove bot from category",
        variant: "destructive",
      });
    }
  };

  const getBotCategories = (botId: string) => {
    const botAssignments = assignments.filter(a => a.bot_id === botId);
    return categories.filter(c => 
      botAssignments.some(a => a.category_id === c.id)
    );
  };

  return {
    categories,
    assignments,
    saveCategory,
    deleteCategory,
    assignBotToCategory,
    removeBotFromCategory,
    getBotCategories,
  };
};