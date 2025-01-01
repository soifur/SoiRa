import { Bot } from "@/hooks/useBots";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
    avatar?: string;
  };
  bot: Bot;
  isLoading?: boolean;
}

export const ChatMessage = ({ message, bot, isLoading = false }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";
  const avatarUrl = isAssistant ? (message.avatar || bot.avatar) : undefined;

  // Remove "Assistant:" or "Human:" prefix from content
  const cleanContent = message.content.replace(/^(Assistant:|Human:)\s*/i, '');

  return (
    <div className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
      <Avatar className="h-8 w-8">
        {avatarUrl ? (
          <>
            <AvatarImage src={avatarUrl} alt="Bot avatar" className="object-cover" />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <AvatarFallback>
            {isAssistant ? 'B' : 'U'}
          </AvatarFallback>
        )}
      </Avatar>
      
      <Card className={`p-3 max-w-[80%] ${isAssistant ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
        <ReactMarkdown className="prose dark:prose-invert max-w-none text-sm">
          {cleanContent}
        </ReactMarkdown>
      </Card>
    </div>
  );
};