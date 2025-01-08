import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  // Fetch shared bot data including quiz_mode and share_key
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

  if (!Array.isArray(messages)) {
    console.warn("Messages prop is not an array:", messages);
    return null;
  }

  // Only show quiz button if shared bot exists and has quiz_mode enabled
  const showQuizButton = selectedBot && sharedBot?.quiz_mode && sharedBot?.share_key;

  return (

        ) : (
            <div className="space-y-4">
                        <ScrollArea>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className="relative group"
                >
                  <ChatMessage
                    message={message.content}
                    isBot={message.role === "assistant"}
                    avatar={message.avatar || selectedBot?.avatar}
                    botName={selectedBot?.name}
                    isLoading={index === messages.length - 1 && message.role === "assistant" && isLoading}
                    isStreaming={index === messages.length - 1 && message.role === "assistant" && isStreaming}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

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
