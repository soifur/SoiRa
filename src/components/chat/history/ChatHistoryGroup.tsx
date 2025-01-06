import React from 'react';
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATE_GROUP_ORDER, DateGroup } from "@/utils/dateUtils";

interface ChatHistoryGroupProps {
  label: string | DateGroup;
  chats: any[];
  isExpanded: boolean;
  onToggle: () => void;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  isModelGroup?: boolean;
  children?: React.ReactNode;
  avatar?: string;
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
  avatar,
}: ChatHistoryGroupProps) => {
  const isDateGroup = DATE_GROUP_ORDER.includes(label as DateGroup);

  if (isDateGroup) {
    return (
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-foreground/70 px-1">
          {label}
        </h3>
        <div className="space-y-1">
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
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className={cn(
        "flex items-center w-full p-1 rounded-lg",
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isModelGroup && "font-semibold"
      )}>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0",
          !isExpanded && "hidden"
        )} />
        <ChevronRight className={cn(
          "h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0",
          isExpanded && "hidden"
        )} />
        {avatar && (
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage src={avatar} alt={label} />
            <AvatarFallback>{label[0]}</AvatarFallback>
          </Avatar>
        )}
        <span className={cn(
          "text-xs truncate flex-1 text-left pr-1",
          isModelGroup && "text-primary"
        )}>{label}</span>
        {chats.length > 0 && (
          <span className="ml-1 text-xs text-muted-foreground shrink-0">
            ({chats.length})
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 space-y-1 mt-1">
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

const getChatTitle = (messages: any[]) => {
  const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
};