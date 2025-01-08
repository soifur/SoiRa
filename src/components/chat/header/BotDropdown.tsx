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
          "h-8 text-sm bg-transparent hover:bg-dropdown-hover",
          "inline-flex items-center whitespace-nowrap",
          isMobile ? "w-auto max-w-[calc(100vw-120px)]" : "flex-shrink"
        )}
      >
        <SelectValue placeholder="Select a model">
          <div className="flex items-center gap-2">
            {selectedBot?.avatar && (
              <img 
                src={selectedBot.avatar} 
                alt={selectedBot.name}
                className="w-5 h-5 rounded-full object-cover shrink-0"
              />
            )}
            <span>{selectedBot?.name || "Select a model"}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        align={isMobile ? "center" : "start"}
        className="min-w-[240px] rounded-xl p-1"
        position="popper"
        side="bottom"
        sideOffset={4}
      >
        {uniqueBots.map((bot) => (
          <SelectItem 
            key={bot.id} 
            value={bot.id}
            className="py-3 px-2 rounded-lg hover:bg-dropdown-hover cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {bot.avatar && (
                <img 
                  src={bot.avatar} 
                  alt={bot.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
              )}
              <span className="text-base">{bot.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};