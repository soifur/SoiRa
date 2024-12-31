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
      // Handle bullet points
      if (paragraph.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mb-2">
            {paragraph.substring(2)}
          </li>
        );
      }
      // Handle bold text
      if (paragraph.includes('**')) {
        const parts = paragraph.split('**');
        return (
          <p key={index} className="mb-2">
            {parts.map((part, i) => (
              i % 2 === 1 ? 
                <strong key={i}>{part}</strong> : 
                <span key={i}>{part}</span>
            ))}
          </p>
        );
      }
      // Regular paragraphs
      return paragraph ? (
        <p key={index} className="mb-2">
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
        className={`max-w-[80%] p-4 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          {role === "assistant" && (
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{selectedBot?.name}</span>
              <span className="text-xs text-muted-foreground">
                {messageTime.toLocaleTimeString()}
              </span>
            </div>
          )}
          <div className="whitespace-pre-wrap leading-relaxed text-base">
            {formatContent(content)}
          </div>
        </div>
      </Card>
    </div>
  );
};