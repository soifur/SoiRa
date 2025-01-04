import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmbeddedChatUI from "./EmbeddedChatUI";

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
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from("bot_categories")
          .select("*")
          .eq("short_key", categoryId)
          .single();

        if (categoryError) throw categoryError;
        
        if (!categoryData) {
          toast({
            title: "Error",
            description: "Category not found or access denied",
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

        // Transform the data to match our Bot interface
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
              apiKey: bot.api_key, // Transform api_key to apiKey
              openRouterModel: bot.open_router_model,
              avatar: bot.avatar,
              memory_enabled: bot.memory_enabled
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
          description: "Failed to load category data",
          variant: "destructive",
        });
      }
    };

    if (categoryId) {
      fetchCategoryAndBots();
    }
  }, [categoryId, toast]);

  if (!category || !clientId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
          <div className="mt-4">
            <Select
              value={selectedBot?.id}
              onValueChange={(value) => {
                const bot = bots.find(b => b.id === value);
                if (bot) setSelectedBot(bot);
              }}
            >
              <SelectTrigger>
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