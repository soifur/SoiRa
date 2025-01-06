import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";

interface BotSelectorProps {
  selectedBotId: string;
  setSelectedBotId: (id: string) => void;
  uniqueBots: Bot[];
}

export const BotSelector = ({ selectedBotId, setSelectedBotId, uniqueBots }: BotSelectorProps) => {
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