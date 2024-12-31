import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2, Link } from "lucide-react";
import { BotForm } from "@/components/BotForm";
import { useBots, Bot } from "@/hooks/useBots";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";

const Bots = () => {
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
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

  const handleEdit = (bot: Bot) => {
    setEditingBot(bot);
    setSelectedBot(bot);
  };

  const handleCopyEmbed = (bot: Bot) => {
    // Generate the correct embed URL using the bot's ID
    const embedUrl = `${window.location.origin}/embed/${bot.id}`;
    const embedCode = `<iframe src="${embedUrl}" width="100%" height="600px" frameborder="0"></iframe>`;
    
    navigator.clipboard.writeText(embedCode).then(() => {
      console.log("Embed URL copied:", embedUrl); // Debug log
      toast({
        title: "Embed Code Copied",
        description: "The embed code has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error("Failed to copy embed code:", err);
      toast({
        title: "Error",
        description: "Failed to copy embed code to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="container mx-auto max-w-full pt-20 px-4">
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-1/2 flex flex-col gap-6 overflow-y-auto">
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
              <Card 
                key={bot.id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedBot?.id === bot.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedBot(bot)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Model: {bot.model}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bot.instructions}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyEmbed(bot);
                      }}
                      title="Copy embed code"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(bot);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBot(bot.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="w-1/2 border-l border-border">
          {selectedBot ? (
            <DedicatedBotChat bot={selectedBot} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a bot to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bots;