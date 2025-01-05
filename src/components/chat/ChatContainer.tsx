import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Message } from "@/components/chat/types/chatTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContainerProps {
  selectedBot: Bot | undefined;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => void;
}

export const ChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
}: ChatContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 relative">
        {selectedBot ? (
          <div className="absolute inset-0">
            <MessageList
              messages={messages}
              selectedBot={selectedBot}
              starters={selectedBot.starters || []}
              onStarterClick={sendMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a model to start chatting
          </div>
        )}
      </div>
      <div className="flex-none p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            disabled={!selectedBot}
            isLoading={isLoading}
            placeholder={selectedBot ? "Type your message..." : "Select a model to start chatting"}
          />
        </div>
      </div>
    </div>
  );
};