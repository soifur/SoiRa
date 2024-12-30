import { Card } from "@/components/ui/card";
import { Bot } from "@/hooks/useBots";

interface ChatMessageProps {
  role: string;
  content: string;
  selectedBot?: Bot;
}

export const ChatMessage = ({ role, content, selectedBot }: ChatMessageProps) => {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-[80%] p-4 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <div className="prose dark:prose-invert max-w-none">
          {role === "assistant" && (
            <p className="font-semibold text-sm mb-2">{selectedBot?.name}</p>
          )}
          <p className="whitespace-pre-wrap m-0 leading-relaxed text-base">
            {content}
          </p>
        </div>
      </Card>
    </div>
  );
};