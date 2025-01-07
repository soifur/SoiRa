import { Bot } from "@/hooks/useBots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BotDropdownProps {
  selectedBotId: string | null;
  setSelectedBotId: (id: string) => void;
  uniqueBots: Bot[];
}

export const BotDropdown = ({
  selectedBotId,
  setSelectedBotId,
  uniqueBots,
}: BotDropdownProps) => {
  const isMobile = useIsMobile();
  const selectedBot = uniqueBots.find(bot => bot.id === selectedBotId);

  return (
    <Select value={selectedBotId || ''} onValueChange={setSelectedBotId}>
      <SelectTrigger 
        className={cn(
          "h-8 text-sm bg-transparent hover:bg-dropdown-hover min-w-0",
          "w-auto inline-flex items-center whitespace-nowrap",
          isMobile ? "max-w-[200px]" : "max-w-[160px]"
        )}
      >
        <SelectValue placeholder="Select a model">
          <div className="flex items-center gap-2 truncate">
            {selectedBot?.avatar && (
              <img 
                src={selectedBot.avatar} 
                alt={selectedBot.name}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            )}
            <span className="truncate">{selectedBot?.name || "Select a model"}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        align="start" 
        className="w-[200px]"
        position="popper"
        side="bottom"
        sideOffset={4}
      >
        {uniqueBots.map((bot) => (
          <SelectItem key={bot.id} value={bot.id}>
            <div className="flex items-center gap-2">
              {bot.avatar && (
                <img 
                  src={bot.avatar} 
                  alt={bot.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              )}
              <span className="truncate">{bot.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};