import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ChatLayoutProps {
  children: {
    messages: ReactNode;
    input: ReactNode;
  };
  onNewChat: () => void;
}

export const ChatLayout = ({ children, onNewChat }: ChatLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2">
        <Button
          onClick={onNewChat}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children.messages}
      </div>
      <div className="mt-auto pb-4">
        {children.input}
      </div>
    </div>
  );
};