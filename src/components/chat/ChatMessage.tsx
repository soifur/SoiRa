import React from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { QuizButton } from "./quiz/QuizButton";

export interface ChatMessageProps {
  message: string;
  isBot: boolean;
  avatar?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  botName?: string;
  showQuizButton?: boolean;
  onStartQuiz?: () => void;
}

export const ChatMessage = ({
  message,
  isBot,
  avatar,
  isLoading,
  isStreaming,
  botName,
  showQuizButton,
  onStartQuiz
}: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "py-4 px-6 flex gap-4",
        isBot ? "bg-muted/50" : "bg-background"
      )}
    >
      {avatar && (
        <img
          src={avatar}
          alt={botName || "Bot"}
          className="w-8 h-8 rounded-full object-cover mt-1"
        />
      )}
      <div className="flex-1 space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Thinking...</span>
          </div>
        ) : (
          <>
            <ReactMarkdown className="prose dark:prose-invert max-w-none">
              {message}
            </ReactMarkdown>
            {showQuizButton && onStartQuiz && (
              <QuizButton
                onClick={onStartQuiz}
              >
                Start Quiz
              </QuizButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};