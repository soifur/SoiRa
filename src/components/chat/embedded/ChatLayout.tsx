import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  onNewChat: () => void;
  children: {
    messages: React.ReactNode;
    input: React.ReactNode;
  };
}

export const ChatLayout = ({ onNewChat, children }: ChatLayoutProps) => {
  return (
    <div 
      className="fixed inset-0 flex flex-col overflow-hidden touch-none bg-background"
      style={{
        height: '100dvh',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none'
      }}
    >
      {/* Header */}
      <div className="flex-none h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full flex items-center justify-end px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <MessageSquarePlus className="h-5 w-5" />
            <span className="ml-2">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className={cn(
          "flex-1 overflow-y-auto overscroll-none",
          "w-full max-w-4xl mx-auto px-4"
        )}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none'
        }}
      >
        {children.messages}
      </div>

      {/* Input Container */}
      <div className="flex-none h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full max-w-4xl mx-auto flex items-center px-4">
          {children.input}
        </div>
      </div>
    </div>
  );
};