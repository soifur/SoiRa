import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Share2, Star, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BotListProps {
  bots: Bot[];
  selectedBot: Bot | null;
  onBotSelect: (bot: Bot) => void;
  onEdit: (bot: Bot) => void;
  onShare: (bot: Bot) => void;
  onDelete: (id: string) => void;
  onSetDefault: (bot: Bot) => void;
}

export const BotList = ({
  bots,
  selectedBot,
  onBotSelect,
  onEdit,
  onShare,
  onDelete,
  onSetDefault,
}: BotListProps) => {
  const truncateInstructions = (instructions: string, lines: number = 2) => {
    if (!instructions) return "";
    const splitInstructions = instructions.split('\n');
    if (splitInstructions.length <= lines) return instructions;
    return `${splitInstructions.slice(0, lines).join('\n')}...`;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {bots.map((bot) => (
          <Card 
            key={bot.id} 
            className={`p-4 transition-all hover:shadow-md ${
              selectedBot?.id === bot.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onBotSelect(bot)}
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
                  className={`h-8 w-8 p-0 ${bot.default_bot ? 'text-yellow-500' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(bot);
                  }}
                >
                  <Star className="h-4 w-4" fill={bot.default_bot ? "currentColor" : "none"} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(bot);
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
                    onEdit(bot);
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
                    onDelete(bot.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};