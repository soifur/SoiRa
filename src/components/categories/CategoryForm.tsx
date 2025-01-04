import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Category } from "./CategoryManagement";
import { Bot } from "@/hooks/useBots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CategoryFormProps {
  editingCategory: Category | null;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof Category, value: any) => void;
  availableBots: Bot[];
  onBotsChange: (bots: Bot[]) => void;
}

export const CategoryForm = ({
  editingCategory,
  onSave,
  onCancel,
  onChange,
  availableBots,
  onBotsChange,
}: CategoryFormProps) => {
  if (!editingCategory) return null;

  const handleBotSelect = (botId: string) => {
    const bot = availableBots.find((b) => b.id === botId);
    if (bot) {
      const currentBots = editingCategory.bots || [];
      if (!currentBots.find((b) => b.id === bot.id)) {
        onBotsChange([...currentBots, bot]);
      }
    }
  };

  const handleRemoveBot = (botId: string) => {
    const currentBots = editingCategory.bots || [];
    onBotsChange(currentBots.filter((bot) => bot.id !== botId));
  };

  return (
    <form onSubmit={onSave} className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={editingCategory.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={editingCategory.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_public"
          checked={editingCategory.is_public || false}
          onCheckedChange={(checked) => onChange("is_public", checked)}
        />
        <Label htmlFor="is_public">Public Category</Label>
      </div>

      <div className="space-y-2">
        <Label>Assigned Bots</Label>
        <Select onValueChange={handleBotSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bot to add" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {availableBots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 mt-2">
          {editingCategory.bots?.map((bot) => (
            <Badge key={bot.id} variant="secondary" className="flex items-center gap-1">
              {bot.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveBot(bot.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {editingCategory.id ? "Update" : "Create"} Category
        </Button>
      </div>
    </form>
  );
};