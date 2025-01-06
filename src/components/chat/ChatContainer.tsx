import { useState } from "react";
import { Bot } from "@/hooks/useBots";
import { Message } from "./types/chatTypes";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatContainerProps {
  selectedBot: Bot | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
  sendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  disabledReason?: string;
  onUpgradeClick?: () => void;
  showHistory?: boolean;
}

export const ChatContainer = ({
  selectedBot,
  messages,
  isLoading,
  isStreaming,
  sendMessage,
  disabled,
  disabledReason,
  onUpgradeClick,
  showHistory
}: ChatContainerProps) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (disabled && onUpgradeClick) {
      setShowUpgradeDialog(true);
      return;
    }
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto px-4">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          showHistory={showHistory}
        />
      </div>
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading}
            isLoading={isLoading}
            placeholder={disabled ? disabledReason : "Type your message..."}
          />
        </div>
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogTitle>Upgrade Required</DialogTitle>
          <div className="space-y-4">
            <p>You've reached your usage limit. Upgrade your plan to continue chatting.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowUpgradeDialog(false);
                onUpgradeClick?.();
              }}>
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};