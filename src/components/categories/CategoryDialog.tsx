import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/useCategories";
import { useBots } from "@/hooks/useBots";
import { Bot } from "@/hooks/useBots";
import { BotCard } from "@/components/categories/BotCard";
import { useToast } from "@/components/ui/use-toast";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryDialog = ({ open, onOpenChange }: CategoryDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBots, setSelectedBots] = useState<Bot[]>([]);
  const { saveCategory } = useCategories();
  const { bots } = useBots();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const category = await saveCategory({
        name,
        description,
        is_public: true,
      });

      // Assign selected bots to the category
      for (const bot of selectedBots) {
        await assignBotToCategory(bot.id, category.id);
      }

      toast({
        title: "Success",
        description: "Category created successfully",
      });
      onOpenChange(false);
      setName("");
      setDescription("");
      setSelectedBots([]);
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const toggleBot = (bot: Bot) => {
    setSelectedBots(prev => 
      prev.some(b => b.id === bot.id)
        ? prev.filter(b => b.id !== bot.id)
        : [...prev, bot]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Select Bots</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  isSelected={selectedBots.some(b => b.id === bot.id)}
                  onToggle={() => toggleBot(bot)}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};