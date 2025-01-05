import { Clock, Plus, Settings, LogOut, Bot, Archive, Home } from "lucide-react";
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
  const { theme, setTheme } = useTheme();
  const [uniqueBots, setUniqueBots] = useState<BotType[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const isMobile = useIsMobile();

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="h-14 flex items-center px-4">
          <div className={cn(
            "flex-1 flex items-center gap-4",
            "transition-[margin] duration-300 ease-in-out",
            showHistory ? "ml-80" : "ml-0"
          )}>
            {isMobile ? (
              // Mobile layout
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
              // Desktop layout
              <>
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
                  onClick={() => navigate('/archive')}
                  className="h-8 w-8 hover:bg-dropdown-hover"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {!isMobile && (
            <>
              <div className={cn(
                "absolute left-1/2 transform -translate-x-1/2",
                "transition-[margin] duration-300 ease-in-out",
                showHistory ? "ml-40" : "ml-0"
              )}>
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

              <div className="flex-1 flex items-center justify-end gap-2">
                <ProfileMenu />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom profile section */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProfileMenu />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {userProfile?.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/upgrade')}
            >
              View plans
            </Button>
          </div>
        </div>
      )}
    </>
  );
};