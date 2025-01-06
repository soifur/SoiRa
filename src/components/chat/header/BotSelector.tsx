import { Bot as BotType } from "@/hooks/useBots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BotSelectorProps {
  selectedBotId: string | null;
  setSelectedBotId: (id: string) => void;
  bots: BotType[];
}

export const BotSelector = ({ selectedBotId, setSelectedBotId, bots }: BotSelectorProps) => {
  if (!selectedBotId || !setSelectedBotId) return null;

  return (
    <Select value={selectedBotId} onValueChange={setSelectedBotId}>
      <SelectTrigger className="min-w-[180px] max-w-fit h-8 text-sm bg-dropdown hover:bg-dropdown-hover">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {bots?.map((bot) => (
          <SelectItem key={bot.id} value={bot.id}>
            {bot.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};