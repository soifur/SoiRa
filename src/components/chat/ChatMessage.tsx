import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Copy, LoaderCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";

export interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  avatar?: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ message, isBot, avatar, isLoading }: ChatMessageProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    toast({
      description: "Message copied to clipboard",
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl mx-auto",
        isBot ? "justify-start" : "justify-end",
        "animate-fade-in"
      )}
    >
      {isBot && (
        <Avatar className="h-8 w-8 shrink-0">
          {isLoading ? (
            <div className="animate-spin">
              <LoaderCircle className="h-4 w-4" />
            </div>
          ) : (
            <img src={avatar || "/placeholder.svg"} alt="Bot" className="h-full w-full object-cover" />
          )}
        </Avatar>
      )}
      <Card
        className={cn(
          "px-6 py-4 rounded-2xl max-w-[85%] relative group",
          isBot ? "bg-accent/50 backdrop-blur-sm" : "bg-primary text-primary-foreground",
          "animate-scale-in"
        )}
      >
        {isBot && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
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
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-4">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/20 pl-4 italic my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};