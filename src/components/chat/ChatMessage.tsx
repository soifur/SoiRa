import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { LoaderCircle, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { parseSmartResponse } from "@/utils/smartResponseUtils";

export interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  avatar?: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  botName?: string;
  onStartQuiz?: () => void;
  showQuizButton?: boolean;
}

export const ChatMessage = ({ 
  message, 
  isBot, 
  avatar, 
  isLoading, 
  isStreaming,
  botName,
  onStartQuiz,
  showQuizButton
}: ChatMessageProps) => {
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
  const smartResponse = isBot ? parseSmartResponse(cleanedMessage) : { response: cleanedMessage };
  const displayMessage = smartResponse.response;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-full max-w-3xl mx-auto px-4",
        isBot ? "items-start" : "items-end"
      )}
    >
      {isBot && (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {isLoading ? (
              <div className="animate-spin">
                <LoaderCircle className="h-4 w-4" />
              </div>
            ) : (
              <img src={avatar || "/placeholder.svg"} alt="Bot" className="h-full w-full object-cover" />
            )}
          </Avatar>
          <span className="text-sm font-medium">{botName || "Assistant"}</span>
          {smartResponse.context?.tone && (
            <span className="text-xs text-muted-foreground">
              Tone: {smartResponse.context.tone}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "relative group max-w-full break-words",
          !isBot && "ml-auto md:max-w-[85%]"
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
        {showQuizButton ? (
          <div className="flex items-center justify-center py-8">
            <Button
              onClick={onStartQuiz}
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              Start Now
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "prose prose-sm dark:prose-invert w-full break-words",
              !isBot && "px-6 py-4 rounded-2xl bg-primary text-primary-foreground",
              isBot && !isEmbedded && "px-6 py-4",
              isStreaming && "after:content-['▋'] after:ml-1 after:animate-[blink_1s_infinite]"
            )}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                pre: ({ children }) => (
                  <pre className="p-4 bg-muted rounded-xl my-4 overflow-x-auto">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 pl-6 space-y-2 list-disc marker:text-foreground/70">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 pl-6 space-y-2 list-decimal marker:text-foreground/70">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed marker:text-foreground/70">
                    {children}
                  </li>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold mb-3 mt-5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold mb-2 mt-4">{children}</h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/20 pl-4 italic my-4">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic">
                    {children}
                  </em>
                ),
              }}
            >
              {displayMessage}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};