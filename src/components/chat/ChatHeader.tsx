import { Bot } from "@/hooks/useBots";
import { Button } from "@/components/ui/button";
import { Menu, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ChatHeaderProps {
  bot: Bot;
  onClearChat: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const ChatHeader = ({ bot, onClearChat, sidebarOpen, onToggleSidebar }: ChatHeaderProps) => {
  const { toast } = useToast();

  const handleClearChat = () => {
    onClearChat();
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  return (
    <div className="border-b border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {!sidebarOpen && (
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <img
            src={bot.avatar || "/placeholder.svg"}
            alt={bot.name}
            className="w-8 h-8 rounded-full"
          />
          <h1 className="text-xl font-semibold">{bot.name}</h1>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClearChat}
        className="text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};