import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Bot {
  id: string;
  name: string;
  instructions: string;
  starters: string[];
}

const Bots = () => {
  const [bots, setBots] = useState<Bot[]>(() => {
    const saved = localStorage.getItem("chatbots");
    return saved ? JSON.parse(saved) : [];
  });
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [newStarter, setNewStarter] = useState("");
  const { toast } = useToast();

  const saveBot = (bot: Bot) => {
    const newBots = editingBot
      ? bots.map((b) => (b.id === bot.id ? bot : b))
      : [...bots, { ...bot, id: Date.now().toString() }];
    setBots(newBots);
    localStorage.setItem("chatbots", JSON.stringify(newBots));
    setEditingBot(null);
    toast({
      title: "Success",
      description: `Bot ${editingBot ? "updated" : "created"} successfully`,
    });
  };

  const deleteBot = (id: string) => {
    const newBots = bots.filter((b) => b.id !== id);
    setBots(newBots);
    localStorage.setItem("chatbots", JSON.stringify(newBots));
    toast({
      title: "Success",
      description: "Bot deleted successfully",
    });
  };

  const addStarter = (bot: Bot) => {
    if (!newStarter.trim()) return;
    const updatedBot = {
      ...bot,
      starters: [...bot.starters, newStarter.trim()],
    };
    setEditingBot(updatedBot);
    setNewStarter("");
  };

  const removeStarter = (bot: Bot, index: number) => {
    const updatedBot = {
      ...bot,
      starters: bot.starters.filter((_, i) => i !== index),
    };
    setEditingBot(updatedBot);
  };

  return (
    <div className="container mx-auto max-w-4xl pt-20">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Chatbots</h1>
          <Button onClick={() => setEditingBot({ id: "", name: "", instructions: "", starters: [] })}>
            <Plus className="mr-2 h-4 w-4" /> New Bot
          </Button>
        </div>

        {editingBot && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingBot.id ? "Edit Bot" : "Create New Bot"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editingBot.name}
                  onChange={(e) => setEditingBot({ ...editingBot, name: e.target.value })}
                  placeholder="Bot name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <Textarea
                  value={editingBot.instructions}
                  onChange={(e) => setEditingBot({ ...editingBot, instructions: e.target.value })}
                  placeholder="Enter instructions for the bot..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conversation Starters</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newStarter}
                    onChange={(e) => setNewStarter(e.target.value)}
                    placeholder="Add a conversation starter"
                  />
                  <Button onClick={() => addStarter(editingBot)}>Add</Button>
                </div>
                <div className="space-y-2">
                  {editingBot.starters.map((starter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1">{starter}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStarter(editingBot, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingBot(null)}>
                  Cancel
                </Button>
                <Button onClick={() => saveBot(editingBot)}>Save</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-4">
          {bots.map((bot) => (
            <Card key={bot.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{bot.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{bot.instructions}</p>
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
                  <Button variant="ghost" size="icon" onClick={() => setEditingBot(bot)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteBot(bot.id)}>
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