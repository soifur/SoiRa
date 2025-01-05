import { useToast } from "@/hooks/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { useChatState } from "@/hooks/useChatState";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UsageLimitAlert } from "./UsageLimitAlert";
import { useChatOperations } from "@/hooks/useChatOperations";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkTokenUsage } = useTokenUsage();
  const [usageExceeded, setUsageExceeded] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    currentUsage: number;
    limit: number;
    resetPeriod: string;
    limitType: string;
  } | null>(null);

  const {
    messages,
    setMessages,
    messagesEndRef,
    chatId
  } = useChatState(bot);

  const {
    isLoading,
    isStreaming,
    handleSendMessage
  } = useChatOperations(bot, messages, setMessages);

  // Check usage limits on component mount and after each message
  useEffect(() => {
    const checkLimits = async () => {
      try {
        console.log("🔄 Checking usage limits...");
        console.log("Bot ID:", bot.id);
        console.log("Messages length:", messages.length);
        
        const usageResult = await checkTokenUsage(bot.id, 1);
        console.log("📊 Usage check result:", usageResult);
        
        setUsageInfo({
          currentUsage: usageResult.currentUsage,
          limit: usageResult.limit,
          resetPeriod: usageResult.resetPeriod,
          limitType: usageResult.limitType
        });
        
        const exceeded = !usageResult.canProceed;
        console.log("❗ Usage exceeded:", exceeded);
        setUsageExceeded(exceeded);
        
      } catch (error) {
        console.error("❌ Error checking usage limits:", error);
        toast({
          title: "Error",
          description: "Failed to check usage limits",
          variant: "destructive",
        });
      }
    };

    checkLimits();
  }, [bot.id, messages.length]);

  const clearChat = () => {
    setMessages([]);
    const chatKey = `chat_${bot.id}_${chatId}`;
    localStorage.removeItem(chatKey);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const sendMessage = async (message: string) => {
    if (usageExceeded) {
      console.log("❌ Cannot send message - usage limit exceeded");
      return;
    }
    
    const success = await handleSendMessage(message, chatId);
    if (!success) {
      setUsageExceeded(true);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4 bg-card">
      {usageExceeded && usageInfo && (
        <UsageLimitAlert usageInfo={usageInfo} />
      )}
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={sendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onClearChat={clearChat}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || isStreaming || usageExceeded}
          isLoading={isLoading}
          placeholder={usageExceeded ? "Usage limit exceeded" : "Type your message..."}
        />
      </div>
    </Card>
  );
};

export default DedicatedBotChat;