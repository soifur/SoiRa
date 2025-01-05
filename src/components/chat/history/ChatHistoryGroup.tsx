import React from 'react';
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { DateGroup } from "@/utils/dateUtils";
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
}: ChatHistoryGroupProps) => {
  const getChatTitle = (messages: any[]) => {
    const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
  };

  // Calculate total chats including nested date groups
  const getTotalChats = () => {
    if (!isModelGroup) return chats.length;
    
    // For model groups, we need to count all chats in child date groups
    let total = chats.length; // Direct chats in the model group
    
    // Count chats in child elements (date groups)
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.chats) {
        total += child.props.chats.length;
      }
    });
    
    return total;
  };

  if (chats.length === 0 && !children) return null;

  const totalChats = getTotalChats();

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className={cn(
        "flex items-center w-full p-2 rounded-lg",
        "hover:bg-accent/50 dark:hover:bg-accent",
        "text-foreground/80 hover:text-foreground",
        isModelGroup && "font-semibold"
      )}>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
        )}
        <span className={cn(
          "font-medium",
          isModelGroup && "text-primary"
        )}>{label}</span>
        {totalChats > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({totalChats})
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-2 mt-2">
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