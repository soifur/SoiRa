import { useState, useEffect } from "react";
import { Bot as BotType } from "@/hooks/useBots";
import { useNavigate } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { MobileHeader } from "./header/MobileHeader";
import { DesktopHeader } from "./header/DesktopHeader";

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

  // Get the selected bot's quiz mode status
  const selectedBot = bots?.find(bot => bot.id === selectedBotId);
  const quizModeEnabled = selectedBot?.quiz_mode || false;

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

  const role = userProfile?.role as UserRole;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center px-4">
        <div className={cn(
          "flex-1 flex items-center gap-3",
          "transition-[margin] duration-300 ease-in-out",
          showHistory ? "ml-64" : "ml-0"
        )}>
          {isMobile ? (
            <MobileHeader
              isChat={isChat}
              onToggleHistory={onToggleHistory!}
              selectedBotId={selectedBotId!}
              setSelectedBotId={setSelectedBotId}
              uniqueBots={uniqueBots}
              quizModeEnabled={quizModeEnabled}
              onNewChat={onNewChat!}
              onQuizComplete={onQuizComplete}
            />
          ) : (
            <DesktopHeader
              isChat={isChat}
              showHistory={showHistory!}
              onToggleHistory={onToggleHistory!}
              onNewChat={onNewChat!}
              isSuperAdmin={isSuperAdmin}
              isAdmin={isAdmin}
              selectedBotId={selectedBotId!}
              setSelectedBotId={setSelectedBotId}
              uniqueBots={uniqueBots}
              quizModeEnabled={quizModeEnabled}
              onQuizComplete={onQuizComplete}
            />
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