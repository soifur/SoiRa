import { useState, useEffect } from "react";
import { Clock, Plus, Bot, Archive, Folder, Users, CreditCard } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const AdminNavigation = () => {
    if (!isSuperAdmin && !isAdmin) return null;

    return (
      <div className="flex flex-col space-y-2">
        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              navigate('/bots');
              setIsMenuOpen(false);
            }}
          >
            <Bot className="h-4 w-4 mr-2" />
            Bots
          </Button>
        )}
        
        {isSuperAdmin && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate('/folders');
                setIsMenuOpen(false);
              }}
            >
              <Folder className="h-4 w-4 mr-2" />
              Folders
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate('/subscriptions');
                setIsMenuOpen(false);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscriptions
            </Button>
          </>
        )}

        {(isSuperAdmin || isAdmin) && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate('/users');
                setIsMenuOpen(false);
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate('/archive');
                setIsMenuOpen(false);
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </>
        )}
      </div>
    );
  };

  const DesktopHeader = () => (
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
      {(isSuperAdmin || isAdmin) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/bots')}
          className="h-8 w-8 hover:bg-dropdown-hover"
        >
          <Bot className="h-4 w-4" />
        </Button>
      )}

      {isSuperAdmin && (
        <>
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
            onClick={() => navigate('/subscriptions')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
        </>
      )}

      {(isSuperAdmin || isAdmin) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/users')}
            className="h-8 w-8 hover:bg-dropdown-hover"
          >
            <Users className="h-4 w-4" />
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
  );

  const MobileHeader = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[280px]">
            <div className="py-4">
              <AdminNavigation />
            </div>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-dropdown-hover"
          onClick={onToggleHistory}
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>

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
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center px-4">
        <div className={cn(
          "flex-1 flex items-center gap-4",
          "transition-[margin] duration-300 ease-in-out",
          showHistory ? "ml-80" : "ml-0"
        )}>
          {isMobile ? <MobileHeader /> : <DesktopHeader />}
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