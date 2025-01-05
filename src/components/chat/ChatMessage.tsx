import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { LoaderCircle, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";

export interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  avatar?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isBot, avatar, isLoading, isStreaming }: ChatMessageProps) => {
  const { toast } = useToast();
  const isEmbedded = window.location.pathname === '/embedded';

  const handleCopy = () => {
    const cleanMessage = message.replace(/^(Assistant|Human):\s*/i, '');
    navigator.clipboard.writeText(cleanMessage);
    toast({
      description: "Message copied to clipboard",
    });
  };

  const cleanedMessage = message.replace(/^(Assistant|Human):\s*/i, '');

  return (
    <div
      className={cn(
        "flex gap-3 w-full max-w-none mx-auto px-4",
        isBot ? "justify-start" : "justify-end"
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
      <div
        className={cn(
          "relative group flex-1",
          !isBot && "ml-auto",
          isBot && !isEmbedded ? "max-w-full" : "max-w-[85%]"
        )}
      >
        {isBot && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
        <div
          className={cn(
            "prose prose-sm dark:prose-invert w-full",
            !isBot && "px-6 py-4 rounded-2xl bg-primary text-primary-foreground",
            isBot && !isEmbedded && "px-6 py-4 rounded-2xl bg-accent/50 backdrop-blur-sm",
            isBot && isEmbedded && "px-6 py-4",
            isStreaming && "animate-pulse"
          )}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed w-full">{children}</p>,
              pre: ({ children }) => (
                <pre className="p-4 bg-muted rounded-xl my-4 overflow-x-auto w-full">
                  {children}
                </pre>
              ),
              ul: ({ children }) => <ul className="mb-4 pl-4 space-y-2 w-full">{children}</ul>,
              ol: ({ children }) => <ol className="mb-4 pl-4 space-y-2 w-full">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 w-full">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5 w-full">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-4 w-full">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/20 pl-4 italic my-4 w-full">
                  {children}
                </blockquote>
              ),
            }}
          >
            {cleanedMessage}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};