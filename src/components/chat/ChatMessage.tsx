import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

export interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  avatar?: string;
}

export const ChatMessage = ({ message, isBot, avatar }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl mx-auto",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <Avatar className="h-8 w-8 shrink-0">
          <img src={avatar || "/placeholder.svg"} alt="Bot" />
        </Avatar>
      )}
      <Card
        className={cn(
          "px-4 py-3 rounded-2xl",
          isBot ? "bg-accent/50" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              pre: ({ children }) => (
                <pre className="p-2 bg-muted rounded-xl my-2 overflow-x-auto">
                  {children}
                </pre>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </Card>
      {!isBot && (
        <Avatar className="h-8 w-8 shrink-0">
          <img src="/placeholder.svg" alt="User" />
        </Avatar>
      )}
    </div>
  );
};