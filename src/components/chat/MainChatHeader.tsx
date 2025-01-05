import { useState, useEffect } from "react";
import { Clock, Plus, Settings, Bot, Archive, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot as BotType } from "@/hooks/useBots";
import { useNavigate } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainChatHeaderProps {
  selectedBotId: string | null;
  setSelectedBotId: (id: string) => void;
  bots?: BotType[];
  onNewChat: () => void;
  onSignOut: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const MainChatHeader = ({
  selectedBotId,
  setSelectedBotId,
  bots,
  onNewChat,
  onSignOut,
  onToggleHistory,
  showHistory,
}: MainChatHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [uniqueBots, setUniqueBots] = useState<BotType[]>([]);

  useEffect(() => {
    if (bots) {
      const botsMap = new Map();
      bots.forEach(bot => {
        if (!botsMap.has(bot.id)) {
          botsMap.set(bot.id, bot);
        }
      });
      setUniqueBots(Array.from(botsMap.values()));
    }
  }, [bots]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center px-4">
        <div className={cn(
          "flex-1 flex items-center gap-4",
          "transition-[margin] duration-300 ease-in-out",
          showHistory ? "ml-80" : "ml-0"
        )}>
          {isMobile ? (
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-dropdown-hover"
                onClick={onToggleHistory}
              >
                <Clock className="h-4 w-4" />
              </Button>

              <Select value={selectedBotId || ""} onValueChange={setSelectedBotId}>
                <SelectTrigger className="min-w-[200px] max-w-fit h-9 text-sm bg-dropdown hover:bg-dropdown-hover">
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

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-dropdown-hover"
                onClick={onNewChat}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {!showHistory && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-dropdown-hover"
                      onClick={onToggleHistory}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-dropdown-hover"
                      onClick={onNewChat}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/bots')}
                  className="h-8 w-8 hover:bg-dropdown-hover"
                >
                  <Bot className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/folders')}
                  className="h-8 w-8 hover:bg-dropdown-hover"
                >
                  <Folder className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/archive')}
                  className="h-8 w-8 hover:bg-dropdown-hover"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                
                <Select value={selectedBotId || ""} onValueChange={setSelectedBotId}>
                  <SelectTrigger className="min-w-[200px] max-w-fit h-9 text-sm bg-dropdown hover:bg-dropdown-hover">
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
              </div>
            </>
          )}
        </div>

        {!isMobile && (
          <div className="flex-1 flex items-center justify-end gap-2">
            <ProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};