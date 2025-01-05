import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bot } from "@/hooks/useBots";
import { BotCategory } from "@/types/categoryTypes";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const EmbeddedCategoryView = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<BotCategory | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('bot_categories')
          .select('*')
          .eq('short_key', categoryId)
          .single();

        if (categoryError) throw categoryError;
        if (!categoryData) {
          toast({
            title: "Error",
            description: "Category not found",
            variant: "destructive",
          });
          return;
        }

        setCategory(categoryData);

        // Fetch bots in this category
        const { data: assignments, error: assignmentsError } = await supabase
          .from('bot_category_assignments')
          .select(`
            bot_id,
            bots (*)
          `)
          .eq('category_id', categoryData.id);

        if (assignmentsError) throw assignmentsError;

        const categoryBots = assignments
          .map(assignment => assignment.bots)
          .filter(bot => bot) as Bot[];

        setBots(categoryBots);
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: "Failed to load category",
          variant: "destructive",
        });
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, toast]);

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {!selectedBot ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card key={bot.id} className="p-4">
              <h3 className="text-lg font-semibold mb-2">{bot.name}</h3>
              <Button 
                onClick={() => setSelectedBot(bot)}
                className="w-full"
              >
                Chat with {bot.name}
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setSelectedBot(null)}
            className="mb-4"
          >
            Back to bot selection
          </Button>
          <DedicatedBotChat bot={selectedBot} />
        </div>
      )}
    </div>
  );
};

export default EmbeddedCategoryView;