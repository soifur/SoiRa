import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { Bot } from "@/hooks/useBots";
import { Category } from "@/components/categories/CategoryManagement";
import { Loader2 } from "lucide-react";

const EmbeddedCategoryChat = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logDebug = (step: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.group(`[${timestamp}] Category Chat Debug`);
    console.log('Step:', step);
    if (data) console.log('Data:', data);
    console.groupEnd();
  };

  const logError = (context: string, error: any) => {
    console.error(`Error in ${context}:`, error);
  };

  useEffect(() => {
    fetchCategoryAndBots();
  }, [categoryId]);

  const fetchCategoryAndBots = async () => {
    try {
      setLoading(true);
      setError(null);
      logDebug(`Starting fetch for category ID: ${categoryId}`);

      // Fetch category
      logDebug('Fetching category data');
      const { data: categoryData, error: categoryError } = await supabase
        .from('bot_categories')
        .select('*')
        .eq('short_key', categoryId);

      if (categoryError) {
        logError("Category fetch", categoryError);
        throw categoryError;
      }

      const foundCategory = categoryData?.[0];
      logDebug('Category data received', foundCategory);

      if (!foundCategory) {
        const notFoundError = "Category not found";
        logError('Category lookup', notFoundError);
        setError(notFoundError);
        setLoading(false);
        return;
      }

      if (!foundCategory.is_public) {
        const notPublicError = "This category is not public";
        logError('Category access', notPublicError);
        setError(notPublicError);
        setLoading(false);
        return;
      }

      // Fetch bot assignments
      logDebug('Fetching bot assignments');
      const { data: assignments, error: assignmentsError } = await supabase
        .from('bot_category_assignments')
        .select('bot_id')
        .eq('category_id', foundCategory.id);

      if (assignmentsError) {
        logError("Assignments fetch", assignmentsError);
        throw assignmentsError;
      }

      logDebug('Assignments received', assignments);

      // Fetch bots data
      if (assignments && assignments.length > 0) {
        logDebug('Fetching bots data');
        const botIds = assignments.map(a => a.bot_id);
        const { data: botsData, error: botsError } = await supabase
          .from('bots')
          .select('*')
          .in('id', botIds);

        if (botsError) {
          logError("Bots fetch", botsError);
          throw botsError;
        }

        logDebug('Bots data received', botsData);

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

      setCategory(foundCategory);
    } catch (error: any) {
      logError("General error", error);
      setError(error.message || "Failed to load category");
    } finally {
      logDebug('Fetch process completed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading category...</div>
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