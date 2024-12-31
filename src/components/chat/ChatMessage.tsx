import { Card } from "@/components/ui/card";
import { Bot } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessageProps {
  role: string;
  content: string;
  selectedBot?: Bot;
  timestamp?: Date;
}

export const ChatMessage = ({ role, content, selectedBot, timestamp }: ChatMessageProps) => {
  // Ensure timestamp is a valid Date object
  const messageTime = timestamp instanceof Date ? timestamp : new Date();

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
            {content.split('\n').map((paragraph, index) => {
              // Handle bullet points
              if (paragraph.startsWith('* ')) {
                return (
                  <li key={index} className="ml-4 mb-2">
                    {paragraph.substring(2)}
                  </li>
                );
              }
              // Handle headers
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                const headerText = paragraph.slice(2, -2);
                return (
                  <h3 key={index} className="font-semibold text-lg mb-2 mt-4">
                    {headerText}
                  </h3>
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
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};