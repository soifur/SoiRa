import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "@/hooks/useBots";
import { cn } from "@/lib/utils";

interface BotCardProps {
  bot: Bot;
  isSelected: boolean;
  onToggle: () => void;
}

export const BotCard = ({ bot, isSelected, onToggle }: BotCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors",
        isSelected ? "border-primary" : "hover:border-primary/50"
      )}
      onClick={onToggle}
    >
      <CardHeader>
        <CardTitle className="text-sm">{bot.name}</CardTitle>
      </CardHeader>
    </Card>
  );
};