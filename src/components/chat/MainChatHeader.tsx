import { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bot as BotType } from "@/hooks/useBots";
import { useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { NavigationButtons } from "./header/NavigationButtons";
import { BotSelector } from "./header/BotSelector";
import { MobileHeader } from "./header/MobileHeader";

interface MainChatHeaderProps {
  selectedBotId?: string | null;
  setSelectedBotId?: (id: string) => void;
  bots?: BotType[];
  onNewChat?: () => void;
  onSignOut?: () => void;
  onToggleHistory?: () => void;
  showHistory?: boolean;
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
  const location = useLocation();
  const isMobile = useIsMobile();
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

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center">
        <div className={cn(
          "flex-1 flex items-center gap-3",
          "transition-[margin] duration-300 ease-in-out",
          showHistory ? "ml-[var(--sidebar-width)]" : "ml-0",
          !isMobile && "pl-4" // Add left padding for desktop view
        )}>
          {isMobile ? (
            <MobileHeader
              isChat={isChat}
              showHistory={showHistory || false}
              onToggleHistory={onToggleHistory || (() => {})}
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId || (() => {})}
              bots={bots}
              onNewChat={onNewChat}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
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
                <NavigationButtons
                  isSuperAdmin={isSuperAdmin}
                  isAdmin={isAdmin}
                  isMobile={isMobile}
                />
                {isChat && selectedBotId && setSelectedBotId && (
                  <BotSelector
                    selectedBotId={selectedBotId}
                    setSelectedBotId={setSelectedBotId}
                    bots={bots || []}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {!isMobile && (
          <div className="flex items-center justify-end px-4">
            <ProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};