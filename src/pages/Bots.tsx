import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ArrowLeft } from "lucide-react";
import { BotForm } from "@/components/BotForm";
import { useBots, Bot } from "@/hooks/useBots";
import DedicatedBotChat from "@/components/chat/DedicatedBotChat";
import { EmbedOptionsDialog } from "@/components/chat/EmbedOptionsDialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BotList } from "@/components/bot/BotList";
import { BotListSkeleton } from "@/components/bot/BotListSkeleton";

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
      setSelectedBot(updatedBot as Bot);
    }
    
    toast({
      title: "Success",
      description: `Bot ${bot.id ? "updated" : "created"} successfully`,
    });
  };

  const handleSetDefaultBot = async (bot: Bot) => {
    try {
      const { error } = await supabase
        .from('bots')
        .update({ default_bot: !bot.default_bot })
        .eq('id', bot.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: bot.default_bot ? "Default bot removed" : "Default bot set successfully",
      });
    } catch (error) {
      console.error("Error setting default bot:", error);
      toast({
        title: "Error",
        description: "Failed to set default bot",
        variant: "destructive",
      });
    }
  };

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
            } as Bot)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New Bot
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-full md:w-1/2 border-r h-full overflow-hidden">
          {isLoading ? (
            <BotListSkeleton />
          ) : (
            <BotList
              bots={bots}
              selectedBot={selectedBot}
              onBotSelect={setSelectedBot}
              onEdit={setEditingBot}
              onShare={setEmbedDialogBot}
              onDelete={deleteBot}
              onSetDefault={handleSetDefaultBot}
            />
          )}
        </div>

        <div className="w-full md:w-1/2 h-full overflow-hidden">
          {editingBot ? (
            <BotForm
              bot={editingBot}
              onSave={handleSave}
              onCancel={() => setEditingBot(null)}
            />
          ) : selectedBot ? (
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