import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { Bot } from "@/hooks/useBots";
import { Category } from "@/components/categories/CategoryManagement";

const EmbeddedCategoryChat = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndBots();
  }, [categoryId]);

  const fetchCategoryAndBots = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('bot_categories')
        .select('*')
        .eq('short_key', categoryId)
        .maybeSingle();

      if (categoryError) throw categoryError;
      
      if (!categoryData) {
        setError("Category not found");
        setLoading(false);
        return;
      }

      if (!categoryData.is_public) {
        setError("This category is not public");
        setLoading(false);
        return;
      }

      // Fetch bot assignments for the category
      const { data: assignments, error: assignmentsError } = await supabase
        .from('bot_category_assignments')
        .select('bot_id')
        .eq('category_id', categoryData.id);

      if (assignmentsError) throw assignmentsError;

      // Fetch bots data
      if (assignments && assignments.length > 0) {
        const botIds = assignments.map(a => a.bot_id);
        const { data: botsData, error: botsError } = await supabase
          .from('bots')
          .select('*')
          .in('id', botIds);

        if (botsError) throw botsError;

        const transformedBots = botsData.map((bot): Bot => ({
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

        setBots(transformedBots);
      }

      setCategory(categoryData);
    } catch (error: any) {
      console.error("Error fetching category data:", error);
      setError(error.message || "Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground">
          {error || "The requested category does not exist or is not public."}
        </p>
      </div>
    );
  }

  return <EmbeddedChatUI category={category} bots={bots} />;
};

export default EmbeddedCategoryChat;