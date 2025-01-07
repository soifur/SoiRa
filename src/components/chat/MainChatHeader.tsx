import { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bot as BotType } from "@/hooks/useBots";
import { useNavigate } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { HeaderButtons } from "./header/HeaderButtons";
import { QuizButton } from "./header/QuizButton";
import { BotDropdown } from "./header/BotDropdown";

interface MainChatHeaderProps {
  selectedBotId?: string | null;
  setSelectedBotId?: (id: string) => void;
  bots?: BotType[];
  onNewChat?: () => void;
  onSignOut?: () => void;
  onToggleHistory?: () => void;
  showHistory?: boolean;
  onQuizComplete?: (instructions: string) => void;
}

export const MainChatHeader = ({
  selectedBotId,
  setSelectedBotId,
  bots,
  onNewChat,
  onSignOut,
  onToggleHistory,
  showHistory,
  onQuizComplete
}: MainChatHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [uniqueBots, setUniqueBots] = useState<BotType[]>([]);
  const isChat = location.pathname === '/';
  
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const role = userProfile?.role as UserRole;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

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
          "flex-1 flex items-center gap-6",
          "transition-[margin] duration-300 ease-in-out",
          showHistory ? "ml-64" : "ml-0"
        )}>
          {isMobile ? (
            <div className="flex items-center justify-between w-full">
              {isChat && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-dropdown-hover"
                    onClick={onToggleHistory}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>

                  {selectedBotId && setSelectedBotId && (
                    <>
                      <BotDropdown
                        selectedBotId={selectedBotId}
                        setSelectedBotId={setSelectedBotId}
                        uniqueBots={uniqueBots}
                      />
                      {selectedBotId && (
                        <QuizButton 
                          bot_id={selectedBotId} 
                          onStartQuiz={() => {}} 
                          onQuizComplete={onQuizComplete}
                        />
                      )}
                    </>
                  )}

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
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6">
                {isChat && !showHistory && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-dropdown-hover"
                      onClick={onToggleHistory}
                    >
                      <Clock className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-dropdown-hover"
                      onClick={onNewChat}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                
                <HeaderButtons isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
                
                {isChat && selectedBotId && setSelectedBotId && (
                  <>
                    <BotDropdown
                      selectedBotId={selectedBotId}
                      setSelectedBotId={setSelectedBotId}
                      uniqueBots={uniqueBots}
                    />
                  </>
                )}
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
