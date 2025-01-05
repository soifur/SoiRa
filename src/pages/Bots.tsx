import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2, Share2, ArrowLeft } from "lucide-react";
import { BotForm } from "@/components/BotForm";
import { useBots, Bot } from "@/hooks/useBots";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";
import { EmbedOptionsDialog } from "@/components/chat/EmbedOptionsDialog";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const Bots = () => {
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [embedDialogBot, setEmbedDialogBot] = useState<Bot | null>(null);
  const { toast } = useToast();
  const { bots, saveBot, deleteBot, isLoading } = useBots();
  const navigate = useNavigate();

  const handleSave = async (bot: Bot) => {
    const updatedBot = await saveBot({ ...bot, accessType: bot.accessType || "private" });
    setEditingBot(null);
    
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
    return `${splitInstructions.slice(0, lines).join('\n')}...`;
  };

  const BotCard = ({ bot }: { bot: Bot }) => (
    <Card 
      key={bot.id} 
      className={`p-4 transition-all hover:shadow-md ${
        selectedBot?.id === bot.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => setSelectedBot(bot)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {bot.avatar && (
              <img 
                src={bot.avatar} 
                alt={bot.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <h3 className="font-semibold">{bot.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Model: {bot.model}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {truncateInstructions(bot.instructions)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0"
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
            className="h-8 w-8 p-0"
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
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">My Chatbots</h1>
        </div>
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

      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-full md:w-1/2 border-r">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {editingBot && (
                <Card className="p-4 mb-4">
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

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {bots.map((bot) => (
                    <BotCard key={bot.id} bot={bot} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="w-full md:w-1/2 h-full">
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