import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createMessage } from "@/utils/messageUtils";
import { saveChatHistory, handleMessageSend } from "@/utils/chatOperations";
import { useChatState } from "@/hooks/useChatState";
import { supabase } from "@/integrations/supabase/client";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    isLoading,
    setIsLoading,
    isStreaming,
    setIsStreaming,
    messagesEndRef,
    chatId
  } = useChatState(bot);

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
    if (!message.trim() || isLoading || isStreaming) {
      console.log("Preventing message send:", { 
        isEmpty: !message.trim(), 
        isLoading, 
        isStreaming 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Checking token usage before sending message");
      const usageResult = await checkTokenUsage(bot.model, 1);
      
      setUsageInfo({
        currentUsage: usageResult.currentUsage,
        limit: usageResult.limit,
        resetPeriod: usageResult.resetPeriod,
        limitType: usageResult.limitType
      });
      
      if (!usageResult.canProceed) {
        console.log("Token usage check failed - cannot proceed");
        setUsageExceeded(true);
        setIsLoading(false);
        return;
      }

      setUsageExceeded(false);
      console.log("Token usage check passed - proceeding with message");
      setIsStreaming(true);

      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const { response, newMessages: updatedMessages } = await handleMessageSend(
        message,
        messages,
        bot,
        setMessages,
        (chunk: string) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: chunk }
              ];
            }
            return prev;
          });
        }
      );

      const { data: nextSequence } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (nextSequence?.sequence_number || 0) + 1;

      await saveChatHistory(
        chatId,
        bot.id,
        [...updatedMessages, createMessage("assistant", response, true, bot.avatar)],
        nextSequenceNumber,
        1
      );

      const chatKey = `chat_${bot.id}_${chatId}`;
      localStorage.setItem(
        chatKey,
        JSON.stringify([...updatedMessages, { ...createMessage("assistant", response, true, bot.avatar) }])
      );

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4 bg-card">
      {usageExceeded && usageInfo && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Usage Limit Exceeded</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              You've reached your {usageInfo.resetPeriod} limit of {usageInfo.limit} {usageInfo.limitType}.
              Current usage: {usageInfo.currentUsage} {usageInfo.limitType}.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/upgrade')}
              className="w-fit"
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          selectedBot={bot}
          starters={bot.starters}
          onStarterClick={sendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
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