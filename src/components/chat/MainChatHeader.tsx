import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MainChatHeaderProps } from "./types/chatTypes";

export const MainChatHeader = ({
  bots,
  selectedBotId,
  onBotSelect,
  setSelectedBotId,
  onNewChat,
  onSignOut,
  onToggleHistory,
  showHistory,
  onQuizComplete
}: MainChatHeaderProps) => {
  const { toast } = useToast();
  const publishedBots = bots.filter(bot => bot.model);

  const handleBotSelect = (value: string) => {
    onBotSelect(value);
    if (setSelectedBotId) {
      setSelectedBotId(value);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        {onToggleHistory && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleHistory}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Select value={selectedBotId} onValueChange={handleBotSelect}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Select a bot" />
          </SelectTrigger>
          <SelectContent>
            {publishedBots.map((bot) => (
              <SelectItem key={bot.id} value={bot.id}>
                {bot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {onSignOut && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};