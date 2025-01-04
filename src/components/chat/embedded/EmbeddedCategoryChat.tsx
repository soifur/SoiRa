import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmbeddedChatUI from "./EmbeddedChatUI";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const EmbeddedCategoryChat = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getClientId = async () => {
      try {
        const { data: { user_ip }, error } = await supabase.functions.invoke('get-client-ip');
        if (error) throw error;
        setClientId(user_ip || Math.random().toString(36).substring(7));
      } catch {
        setClientId(Math.random().toString(36).substring(7));
      }
    };
    getClientId();
  }, []);

  useEffect(() => {
    const fetchCategoryAndBots = async () => {
      try {
        setIsLoading(true);
        // Fetch category using maybeSingle() instead of single()
        const { data: categoryData, error: categoryError } = await supabase
          .from("bot_categories")
          .select("*")
          .eq("short_key", categoryId)
          .maybeSingle();

        if (categoryError) throw categoryError;
        
        if (!categoryData) {
          toast({
            title: "Category not found",
            description: "The requested category does not exist or is not public",
            variant: "destructive",
          });
          return;
        }

        setCategory(categoryData);

        // Fetch bots in this category
        const { data: botsData, error: botsError } = await supabase
          .from("bot_category_assignments")
          .select(`
            bot_id,
            bots (
              id,
              name,
              instructions,
              starters,
              model,
              api_key,
              open_router_model,
              avatar,
              memory_enabled
            )
          `)
          .eq("category_id", categoryData.id);

        if (botsError) throw botsError;

        const validBots = botsData
          .map(assignment => {
            const bot = assignment.bots;
            if (!bot) return null;
            
            return {
              id: bot.id,
              name: bot.name,
              instructions: bot.instructions || "",
              starters: bot.starters || [],
              model: bot.model,
              apiKey: bot.api_key,
              openRouterModel: bot.open_router_model,
              avatar: bot.avatar,
              memory_enabled: bot.memory_enabled,
              accessType: "public"
            } as Bot;
          })
          .filter((bot): bot is Bot => bot !== null);

        setBots(validBots);
        if (validBots.length > 0) {
          setSelectedBot(validBots[0]);
        }

      } catch (error) {
        console.error("Error fetching category data:", error);
        toast({
          title: "Error",
          description: "Failed to load category data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndBots();
    }
  }, [categoryId, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Category Not Found</h1>
          <p className="text-muted-foreground">
            The requested category does not exist or is not public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="mt-4">
            <Select
              value={selectedBot?.id}
              onValueChange={(value) => {
                const bot = bots.find(b => b.id === value);
                if (bot) setSelectedBot(bot);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bot to chat with" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {selectedBot && (
        <div className="flex-1 overflow-hidden">
          <EmbeddedChatUI
            bot={selectedBot}
            clientId={clientId}
            shareKey={categoryId}
          />
        </div>
      )}
    </div>
  );
};

export default EmbeddedCategoryChat;