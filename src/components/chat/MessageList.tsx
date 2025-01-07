import { useEffect, useRef } from "react";
import { Message } from "./types/chatTypes";
import { ChatMessage } from "./ChatMessage";
import { Button } from "../ui/button";
import { Bot } from "@/hooks/useBots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  selectedBot?: Bot;
  onStarterClick?: (starter: string) => void;
  onStartQuiz?: () => void;
  starters?: string[];
  disabled?: boolean;
  disabledReason?: string;
}

export const MessageList = ({
  messages,
  isLoading,
  isStreaming,
  selectedBot,
  onStarterClick,
  onStartQuiz,
  starters,
  disabled,
  disabledReason,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: quizEnabled } = useQuery({
    queryKey: ['quiz-enabled', selectedBot?.id],
    queryFn: async () => {
      if (!selectedBot?.id) return false;

      // First check bots table
      const { data: bot } = await supabase
        .from('bots')
        .select('quiz_mode')
        .eq('id', selectedBot.id)
        .maybeSingle();

      if (bot?.quiz_mode) return true;

      // If not found or not enabled, check shared_bots table
      const { data: sharedBot } = await supabase
        .from('shared_bots')
        .select('quiz_mode')
        .eq('bot_id', selectedBot.id)
        .maybeSingle();

      return sharedBot?.quiz_mode || false;
    },
    enabled: !!selectedBot?.id
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
        {selectedBot && (
          <>
            <div className="text-2xl font-semibold mb-4">
              Chat with {selectedBot.name}
            </div>
            {quizEnabled ? (
              <Button
                variant="default"
                size="lg"
                onClick={() => onStartQuiz?.()}
                className="mb-8 md:mb-12 w-64 h-16 text-xl font-semibold hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Start Quiz Now
              </Button>
            ) : starters && starters.length > 0 ? (
              <div className="flex flex-col items-center space-y-2">
                <p className="text-lg font-medium mb-4">Start the conversation with:</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                  {starters.map((starter, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => onStarterClick?.(starter)}
                      className="text-sm"
                      disabled={disabled}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          isLast={index === messages.length - 1}
          isLoading={isLoading && index === messages.length - 1}
          isStreaming={isStreaming && index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};