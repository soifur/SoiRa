import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2, Share2 } from "lucide-react";
import { BotForm } from "@/components/BotForm";
import { useBots, Bot } from "@/hooks/useBots";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";
import { EmbedOptionsDialog } from "@/components/chat/EmbedOptionsDialog";

const Bots = () => {
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [embedDialogBot, setEmbedDialogBot] = useState<Bot | null>(null);
  const { toast } = useToast();
  const { bots, saveBot, deleteBot } = useBots();

  const handleSave = async (bot: Bot) => {
    const updatedBot = await saveBot({ ...bot, accessType: bot.accessType || "private" });
    setEditingBot(null);
    
    // Update the selected bot if it was being edited
    if (selectedBot && selectedBot.id === bot.id) {
      setSelectedBot(updatedBot);
    }
    
    toast({
      title: "Success",
      description: `Bot ${bot.id ? "updated" : "created"} successfully`,
    });
  };

  const handleEdit = (bot: Bot) => {
    setEditingBot(bot);
    setSelectedBot(bot);
  };

  const truncateInstructions = (instructions: string, lines: number = 2) => {
    if (!instructions) return "";
    const splitInstructions = instructions.split('\n');
    if (splitInstructions.length <= lines) return instructions;
    
    const truncated = splitInstructions.slice(0, lines).join('\n');
    return `${truncated}...`;
  };

  return (
    <div className="container mx-auto max-w-full pt-20 px-4">
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
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
                  accessType: "private",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> New Bot
            </Button>
          </div>

          {editingBot && (
            <Card className="p-4">
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

          <div className="grid gap-2">
            {bots.map((bot) => (
              <Card 
                key={bot.id} 
                className={`p-2 cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedBot?.id === bot.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedBot(bot)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <h3 className="text-sm font-semibold">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {bot.model}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {truncateInstructions(bot.instructions)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmbedDialogBot(bot);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(bot);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
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
            <DedicatedBotChat key={selectedBot.id} bot={selectedBot} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a bot to start chatting
            </div>
          )}
        </div>
      </div>

      <EmbedOptionsDialog 
        isOpen={!!embedDialogBot}
        onClose={() => setEmbedDialogBot(null)}
        bot={embedDialogBot as Bot}
      />
    </div>
  );
};

export default Bots;
