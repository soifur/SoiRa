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
  const [debugInfo, setDebugInfo] = useState<any>({
    categoryId: null,
    categoryData: null,
    assignments: null,
    botsData: null,
    errors: [],
    loadingSteps: []
  });

  useEffect(() => {
    fetchCategoryAndBots();
  }, [categoryId]);

  const addLoadingStep = (step: string) => {
    setDebugInfo(prev => ({
      ...prev,
      loadingSteps: [...prev.loadingSteps, `${new Date().toISOString()}: ${step}`]
    }));
  };

  const addError = (error: any, context: string) => {
    setDebugInfo(prev => ({
      ...prev,
      errors: [...prev.errors, { context, error, timestamp: new Date().toISOString() }]
    }));
  };

  const fetchCategoryAndBots = async () => {
    try {
      setLoading(true);
      setError(null);
      addLoadingStep(`Starting fetch for category ID: ${categoryId}`);
      setDebugInfo(prev => ({ ...prev, categoryId }));

      // Fetch category
      addLoadingStep('Fetching category data');
      const { data: categoryData, error: categoryError } = await supabase
        .from('bot_categories')
        .select('*')
        .eq('short_key', categoryId)
        .maybeSingle();

      if (categoryError) {
        console.error("Error fetching category:", categoryError);
        addError(categoryError, 'Category fetch error');
        throw categoryError;
      }
      
      addLoadingStep(`Category data received: ${JSON.stringify(categoryData)}`);
      setDebugInfo(prev => ({ ...prev, categoryData }));

      if (!categoryData) {
        const notFoundError = "Category not found";
        addError(notFoundError, 'Category not found');
        setError(notFoundError);
        setLoading(false);
        return;
      }

      if (!categoryData.is_public) {
        const notPublicError = "This category is not public";
        addError(notPublicError, 'Category not public');
        setError(notPublicError);
        setLoading(false);
        return;
      }

      // Fetch bot assignments for the category
      addLoadingStep('Fetching bot assignments');
      const { data: assignments, error: assignmentsError } = await supabase
        .from('bot_category_assignments')
        .select('bot_id')
        .eq('category_id', categoryData.id);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        addError(assignmentsError, 'Assignments fetch error');
        throw assignmentsError;
      }

      addLoadingStep(`Assignments received: ${JSON.stringify(assignments)}`);
      setDebugInfo(prev => ({ ...prev, assignments }));

      // Fetch bots data
      if (assignments && assignments.length > 0) {
        addLoadingStep('Fetching bots data');
        const botIds = assignments.map(a => a.bot_id);
        const { data: botsData, error: botsError } = await supabase
          .from('bots')
          .select('*')
          .in('id', botIds);

        if (botsError) {
          console.error("Error fetching bots:", botsError);
          addError(botsError, 'Bots fetch error');
          throw botsError;
        }

        addLoadingStep(`Bots data received: ${JSON.stringify(botsData)}`);
        setDebugInfo(prev => ({ ...prev, botsData }));

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
      addError(error, 'General error');
      setError(error.message || "Failed to load category");
    } finally {
      addLoadingStep('Fetch process completed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading category...</div>
        <div className="mt-4 p-4 bg-muted rounded-lg max-w-lg">
          <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
          <div className="text-xs space-y-2">
            <div>
              <strong>Category ID:</strong> {categoryId}
            </div>
            <div>
              <strong>Loading Steps:</strong>
              <pre className="mt-1 overflow-auto max-h-40">
                {debugInfo.loadingSteps.join('\n')}
              </pre>
            </div>
            {debugInfo.errors.length > 0 && (
              <div>
                <strong>Errors:</strong>
                <pre className="mt-1 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
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
        <div className="mt-4 p-4 bg-muted rounded-lg max-w-lg">
          <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
          <div className="text-xs space-y-2">
            <div>
              <strong>Category ID:</strong> {categoryId}
            </div>
            <div>
              <strong>Loading Steps:</strong>
              <pre className="mt-1 overflow-auto max-h-40">
                {debugInfo.loadingSteps.join('\n')}
              </pre>
            </div>
            {debugInfo.errors.length > 0 && (
              <div>
                <strong>Errors:</strong>
                <pre className="mt-1 overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <EmbeddedChatUI category={category} bots={bots} />;
};

export default EmbeddedCategoryChat;