import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { cn } from "@/lib/utils";

interface ChatHistoryGroupProps {
  label: string;
  chats: any[];
  isExpanded: boolean;
  onToggle: () => void;
  currentChatId?: string;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isModelGroup?: boolean;
  avatar?: string;
  children?: React.ReactNode;
}

export const ChatHistoryGroup = ({
  label,
  chats,
  isExpanded,
  onToggle,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  isModelGroup,
  avatar,
  children
}: ChatHistoryGroupProps) => {
  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between px-2 hover:bg-accent hover:text-accent-foreground",
          isModelGroup ? "font-semibold" : "text-sm text-muted-foreground"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {avatar && (
            <img
              src={avatar}
              alt={label}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <span>{label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )}
        />
      </Button>
      {isExpanded && (
        <div className="pl-2">
          {children || chats.map((chat) => (
            <ChatHistoryItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === currentChatId}
              onSelect={() => onSelectChat(chat.id)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};