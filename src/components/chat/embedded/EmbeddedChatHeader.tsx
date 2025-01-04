import { History, Plus, X, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bot } from "@/hooks/useBots";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface EmbeddedChatHeaderProps {
  bot: Bot;
  onClearChat?: () => void;
  onToggleHistory: () => void;
  onNewChat?: () => void;
  showHistory: boolean;
  isAuthenticated?: boolean | null;
}

export const EmbeddedChatHeader = ({
  bot,
  onClearChat,
  onToggleHistory,
  onNewChat,
  showHistory,
  isAuthenticated
}: EmbeddedChatHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleHistory}
        >
          <History className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={bot.avatar} />
            <AvatarFallback>{bot.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{bot.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onNewChat && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNewChat}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
        {!isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/login')}
          >
            <LogIn className="h-5 w-5" />
          </Button>
        )}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};