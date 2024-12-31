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
          "px-6 py-4 rounded-2xl max-w-[85%]",
          isBot ? "bg-accent/50 backdrop-blur-sm" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
              pre: ({ children }) => (
                <pre className="p-4 bg-muted rounded-xl my-4 overflow-x-auto">
                  {children}
                </pre>
              ),
              ul: ({ children }) => <ul className="mb-4 pl-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 pl-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
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