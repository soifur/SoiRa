import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { BotForm } from "@/components/BotForm";
import { useBots, Bot } from "@/hooks/useBots";

const Bots = () => {
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const { toast } = useToast();
  const { bots, saveBot, deleteBot } = useBots();

  const handleSave = (bot: Bot) => {
    saveBot(bot);
    setEditingBot(null);
    toast({
      title: "Success",
      description: `Bot ${editingBot ? "updated" : "created"} successfully`,
    });
  };

  return (
    <div className="container mx-auto max-w-4xl pt-20">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Chatbots</h1>
          <Button
            onClick={() =>
              setEditingBot({
                id: "",
                name: "",
                instructions: "",
                starters: [],
                model: "gemini",
                apiKey: "",
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> New Bot
          </Button>
        </div>

        {editingBot && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingBot.id ? "Edit Bot" : "Create New Bot"}
            </h2>
            <BotForm
              bot={editingBot}
              onSave={handleSave}
              onCancel={() => setEditingBot(null)}
            />
          </Card>
        )}

        <div className="grid gap-4">
          {bots.map((bot) => (
            <Card key={bot.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{bot.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Model: {bot.model}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bot.instructions}
                  </p>
                  {bot.starters.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Conversation Starters:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {bot.starters.map((starter, index) => (
                          <li key={index}>{starter}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingBot(bot)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBot(bot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bots;