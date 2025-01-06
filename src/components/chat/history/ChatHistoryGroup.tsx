import React from 'react';
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { cn } from "@/lib/utils";

interface ChatHistoryGroupProps {
  label: string;
  chats: any[];
  isExpanded: boolean;
  onToggle: () => void;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  isModelGroup?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ChatHistoryGroup = ({
  label,
  chats,
  isExpanded,
  onToggle,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  isModelGroup = false,
  children,
  className,
}: ChatHistoryGroupProps) => {
  const getChatTitle = (messages: any[]) => {
    const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
  };

  if (chats.length === 0 && !children) return null;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className={cn(
        "flex items-center w-full py-1 px-2 rounded-lg", // Reduced padding
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isModelGroup && "font-semibold",
        className
      )}>
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 mr-1 text-muted-foreground" /> // Reduced icon size and margin
        ) : (
          <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" /> // Reduced icon size and margin
        )}
        <span className={cn(
          "font-medium truncate",
          isModelGroup && "text-primary"
        )}>{label}</span>
        {(chats.length > 0 || (children && isModelGroup)) && (
          <span className="ml-1 text-xs text-muted-foreground">
            ({chats.length || 0})
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 space-y-1 mt-1"> {/* Reduced spacing */}
        {children}
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