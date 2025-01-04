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
        if (!shortKey) {
          toast({
            title: "Error",
            description: "Invalid category link",
            variant: "destructive",
          });
          return;
        }

        // First fetch the category with its bot assignments
        const { data: categoryData, error: categoryError } = await supabase
          .from('bot_categories')
          .select(`
            *,
            bot_category_assignments!inner (
              bot_id,
              bots!inner (
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
            )
          `)
          .eq('short_key', shortKey)
          .maybeSingle();

        if (categoryError) {
          console.error("Error fetching category:", categoryError);
          toast({
            title: "Error",
            description: "Failed to fetch category",
            variant: "destructive",
          });
          return;
        }

        if (!categoryData) {
          console.error("Category not found");
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Category data:", categoryData);
        setCategory(categoryData);

        // Transform the nested bot data
        if (categoryData.bot_category_assignments?.length) {
          const transformedBots: Bot[] = categoryData.bot_category_assignments.map((assignment: any) => ({
            id: assignment.bots.id,
            name: assignment.bots.name,
            instructions: assignment.bots.instructions || "",
            starters: assignment.bots.starters || [],
            model: assignment.bots.model,
            apiKey: assignment.bots.api_key,
            openRouterModel: assignment.bots.open_router_model,
            avatar: assignment.bots.avatar,
            accessType: "public",
            memory_enabled: assignment.bots.memory_enabled,
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
          <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mb-6">{category.description}</p>
          )}
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
                    <div className="flex items-center gap-3">
                      {bot.avatar && (
                        <img 
                          src={bot.avatar} 
                          alt={bot.name} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{bot.name}</h3>
                        {bot.instructions && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {bot.instructions}
                          </p>
                        )}
                      </div>
                    </div>
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