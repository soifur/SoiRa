import { Bot as BotType } from "@/hooks/useBots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BotSelectorProps {
  selectedBotId: string;
  setSelectedBotId: (id: string) => void;
  bots: BotType[];
}

export const BotSelector = ({ selectedBotId, setSelectedBotId, bots }: BotSelectorProps) => {
  const uniqueBots = Array.from(new Map(bots.map(bot => [bot.id, bot])).values());

  return (
    <Select value={selectedBotId} onValueChange={setSelectedBotId}>
      <SelectTrigger className="min-w-[180px] max-w-fit h-8 text-sm bg-dropdown hover:bg-dropdown-hover">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {uniqueBots.map((bot) => (
          <SelectItem key={bot.id} value={bot.id}>
            {bot.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};