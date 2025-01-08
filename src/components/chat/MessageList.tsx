import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageCircle, HelpCircle, Code, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizButton } from "./quiz/QuizButton";
import { Bot } from "@/hooks/useBots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  avatar?: string;
}

interface MessageListProps {
  messages: Message[];
  selectedBot?: Bot;
  starters?: string[];
  onStarterClick?: (value: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onClearChat?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  onQuizComplete?: (instructions: string) => void;
}

export const MessageList = ({ 
  messages = [],
  selectedBot, 
  starters = [], 
  onStarterClick, 
  isLoading,
  isStreaming,
  onClearChat,
  disabled,
  disabledReason,
  onQuizComplete
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const { data: sharedBot } = useQuery({
    queryKey: ['shared-bot', selectedBot?.id],
    queryFn: async () => {
      if (!selectedBot?.id) return null;
      const { data, error } = await supabase
        .from('shared_bots')
        .select('quiz_mode, share_key')
        .eq('bot_id', selectedBot.id)
        .single();

      if (error) {
        console.error('Error fetching shared bot:', error);
        return null;
      }
      return data;
    },
    enabled: !!selectedBot?.id
  });

  useEffect(() => {
    if (lastMessageRef.current && !isLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const getStarterIcon = (starter: string) => {
    const lowerStarter = starter.toLowerCase();
    if (lowerStarter.includes('help') || lowerStarter.includes('how')) {
      return HelpCircle;
    }
    if (lowerStarter.includes('code') || lowerStarter.includes('program')) {
      return Code;
    }
    if (lowerStarter.includes('explain') || lowerStarter.includes('learn')) {
      return BookOpen;
    }
    if (lowerStarter.includes('idea') || lowerStarter.includes('suggest')) {
      return Lightbulb;
    }
    return MessageCircle;
  };

  if (!Array.isArray(messages)) {
    console.warn("Messages prop is not an array:", messages);
    return null;
  }

  const showQuizButton = selectedBot && sharedBot?.quiz_mode && sharedBot?.share_key;

  return messages.length === 0 ? (
    <>
      {selectedBot && (
        <>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            {selectedBot.name}
          </h2>
          {showQuizButton && selectedBot.id && (
            <QuizButton 
              bot_id={selectedBot.id}
              onStartQuiz={() => {}}
              onQuizComplete={onQuizComplete}
            />
          )}
        </>
      )}
      {starters && starters.length > 0 && (
        <>
          <h1 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-foreground text-center">
            What can I help with?
          </h1>
          {starters.map((starter, index) => {
            const Icon = getStarterIcon(starter);
            return (
              <button
                key={index}
                className={cn(
                  "flex items-center justify-start gap-2 md:gap-3 p-3 md:p-4 h-auto",
                  "text-sm md:text-base w-full", 
                  "rounded-xl md:rounded-2xl hover:bg-accent/50 transition-colors",
                  "bg-background/50 backdrop-blur-sm border border-muted-foreground/20",
                  "whitespace-normal text-left mb-2",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && onStarterClick && onStarterClick(starter)}
                disabled={disabled}
                title={disabled ? disabledReason : undefined}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="text-left break-words">{starter}</span>
              </button>
            );
          })}
        </>
      )}
    </>
  ) : (
    messages.map((message, index) => (
      <ChatMessage
        key={message.id}
        ref={index === messages.length - 1 ? lastMessageRef : null}
        message={message.content}
        isBot={message.role === "assistant"}
        avatar={message.avatar || selectedBot?.avatar}
        botName={selectedBot?.name}
        isLoading={index === messages.length - 1 && message.role === "assistant" && isLoading}
        isStreaming={index === messages.length - 1 && message.role === "assistant" && isStreaming}
      />
    ))
  );
};