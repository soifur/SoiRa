import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { DateGroup } from "@/utils/dateUtils";

interface ChatHistoryGroupProps {
  label: string;
  chats: any[];
  isExpanded: boolean;
  onToggle: () => void;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
}

export const ChatHistoryGroup = ({
  label,
  chats,
  isExpanded,
  onToggle,
  currentChatId,
  onSelectChat,
  onDeleteChat,
}: ChatHistoryGroupProps) => {
  const getChatTitle = (messages: any[]) => {
    const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
  };

  if (chats.length === 0) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center w-full p-2 rounded-lg hover:bg-accent">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        <span className="font-medium">{label}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          ({chats.length})
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-2 mt-2">
        {chats.map((chat) => (
          <ChatHistoryItem
            key={chat.id}
            id={chat.id}
            title={getChatTitle(chat.messages)}
            isActive={currentChatId === chat.id}
            onSelect={() => onSelectChat(chat.id)}
            onDelete={(e) => onDeleteChat(chat.id, e)}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};