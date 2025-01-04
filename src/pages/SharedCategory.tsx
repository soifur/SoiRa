import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";
import { Bot } from "@/hooks/useBots";

export default function SharedCategory() {
  const { shortKey } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // First fetch the category with its bot assignments
        const { data: categoryData, error: categoryError } = await supabase
          .from('bot_categories')
          .select(`
            *,
            bot_category_assignments (
              bot_id
            )
          `)
          .eq('short_key', shortKey)
          .single();

        if (categoryError || !categoryData) {
          console.error("Error fetching category:", categoryError);
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          });
          return;
        }

        setCategory(categoryData);

        // Then fetch the bots data if there are assignments
        if (categoryData.bot_category_assignments?.length) {
          const botIds = categoryData.bot_category_assignments.map((a: any) => a.bot_id);
          
          const { data: botsData, error: botsError } = await supabase
            .from('bots')
            .select('*')
            .in('id', botIds);

          if (botsError) {
            console.error("Error fetching bots:", botsError);
            toast({
              title: "Error",
              description: "Failed to fetch bots",
              variant: "destructive",
            });
            return;
          }

          // Transform the data to match our Bot interface
          const transformedBots: Bot[] = (botsData || []).map(bot => ({
            id: bot.id,
            name: bot.name,
            instructions: bot.instructions || "",
            starters: bot.starters || [],
            model: bot.model,
            apiKey: bot.api_key,
            openRouterModel: bot.open_router_model,
            avatar: bot.avatar,
            accessType: "public",
            memory_enabled: bot.memory_enabled,
          }));

          console.log("Transformed bots:", transformedBots);
          setBots(transformedBots);
        }
      } catch (error) {
        console.error("Error in fetchCategory:", error);
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        });
      }
    };

    if (shortKey) {
      fetchCategory();
    }
  }, [shortKey, toast]);

  return (
    <div className="container mx-auto p-4 pt-20">
      {category && (
        <>
          <h1 className="text-2xl font-bold mb-6">{category.name}</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Bots</h2>
              <div className="grid gap-4">
                {bots.map((bot) => (
                  <Card
                    key={bot.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedBot?.id === bot.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedBot(bot)}
                  >
                    <h3 className="font-medium">{bot.name}</h3>
                    {bot.instructions && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {bot.instructions}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
            <div className="border-l border-border pl-6">
              {selectedBot ? (
                <DedicatedBotChat key={selectedBot.id} bot={selectedBot} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a bot to start chatting
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}