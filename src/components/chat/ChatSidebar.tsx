import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChatListItem } from "../archive/ChatListItem";
import { ChatRecord } from "../archive/types";
import { Bot } from "@/hooks/useBots";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  chatHistory: ChatRecord[];
  bot: Bot;
  onChatSelect: (chat: ChatRecord) => void;
}

export const ChatSidebar = ({
  sidebarOpen,
  onToggleSidebar,
  chatHistory,
  bot,
  onChatSelect
}: ChatSidebarProps) => {
  return (
    <div className={`border-r border-border ${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <ChatListItem
                key={chat.id}
                record={chat}
                bot={bot}
                onClick={() => onChatSelect(chat)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};