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
        "flex gap-3 mb-2",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <Avatar className="h-8 w-8">
          <img src={avatar || "/placeholder.svg"} alt="Bot" />
        </Avatar>
      )}
      <Card
        className={cn(
          "px-3 py-2 max-w-[80%]",
          isBot ? "bg-accent" : "bg-primary text-primary-foreground"
        )}
      >
        <div className="prose prose-sm max-w-none space-y-2">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              pre: ({ children }) => (
                <pre className="p-2 bg-muted rounded-md my-2">{children}</pre>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </Card>
      {!isBot && (
        <Avatar className="h-8 w-8">
          <img src="/placeholder.svg" alt="User" />
        </Avatar>
      )}
    </div>
  );
};