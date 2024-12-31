import { Card } from "@/components/ui/card";
import { Bot } from "@/hooks/useBots";

interface ChatMessageProps {
  role: string;
  content: string;
  selectedBot?: Bot;
  timestamp?: Date;
}

export const ChatMessage = ({ role, content, selectedBot, timestamp }: ChatMessageProps) => {
  const messageTime = timestamp instanceof Date ? timestamp : new Date();

  const formatContent = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {paragraph.substring(2)}
          </li>
        );
      }
      if (paragraph.includes('**')) {
        const parts = paragraph.split('**');
        return (
          <p key={index} className="mb-1">
            {parts.map((part, i) => (
              i % 2 === 1 ? 
                <strong key={i}>{part}</strong> : 
                <span key={i}>{part}</span>
            ))}
          </p>
        );
      }
      return paragraph ? (
        <p key={index} className="mb-1">
          {paragraph}
        </p>
      ) : (
        <br key={index} />
      );
    });
  };

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-[80%] p-2 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        }`}
      >
        <div className="prose dark:prose-invert max-w-none text-sm">
          {role === "assistant" && (
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-semibold">{selectedBot?.name}</span>
              <span className="text-muted-foreground">
                {messageTime.toLocaleTimeString()}
              </span>
            </div>
          )}
          <div className="whitespace-pre-wrap leading-relaxed">
            {formatContent(content)}
          </div>
        </div>
      </Card>
    </div>
  );
};