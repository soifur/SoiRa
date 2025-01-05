import { History, Plus, Sun, Moon, Settings, LogOut, Bot, Archive, Home } from "lucide-react";
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
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MainChatHeaderProps {
  selectedBotId: string | null;
  setSelectedBotId: (id: string) => void;
  bots?: BotType[];
  onNewChat: () => void;
  onSignOut: () => void;
}

interface SharedBot {
  id: string;
  bot_name: string;
  share_key: string;
}

export const MainChatHeader = ({
  selectedBotId,
  setSelectedBotId,
  bots,
  onNewChat,
  onSignOut,
}: MainChatHeaderProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sharedBots, setSharedBots] = useState<SharedBot[]>([]);

  useEffect(() => {
    const fetchSharedBots = async () => {
      const { data, error } = await supabase
        .from('shared_bots')
        .select('id, bot_name, share_key')
        .order('bot_name');

      if (error) {
        console.error('Error fetching shared bots:', error);
        return;
      }

      setSharedBots(data);
    };

    fetchSharedBots();
  }, []);

  // Combine user's bots and shared bots for the selector
  const allBots = [
    ...(bots || []).map(bot => ({
      id: bot.id,
      name: bot.name,
      isShared: false
    })),
    ...sharedBots.map(bot => ({
      id: bot.share_key,
      name: `${bot.bot_name} (Shared)`,
      isShared: true
    }))
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-14 flex items-center justify-between px-4 max-w-[1200px] mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold"
            onClick={() => navigate('/')}
          >
            SoiRa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bots')}
          >
            Bots
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/archive')}
          >
            Archive
          </Button>
        </div>

        <Select value={selectedBotId || ""} onValueChange={setSelectedBotId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a bot" />
          </SelectTrigger>
          <SelectContent>
            {allBots.map((bot) => (
              <SelectItem key={bot.id} value={bot.id}>
                {bot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/archive')}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};