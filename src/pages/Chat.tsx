import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { Bot, ChatMessage, Message } from "@/components/chat/types/chatTypes";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { botId: selectedBotId } = useParams();
  const { toast } = useToast();
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  const {
    isExceeded,
    resetDate,
    currentUsage,
    maxUsage,
    limitType
  } = useSubscriptionLimits(selectedBotId || null);

  // Load bot details
  useEffect(() => {
    const loadBot = async () => {
      if (!selectedBotId) return;

      const { data: bot, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', selectedBotId)
        .single();

      if (error) {
        console.error("Error loading bot:", error);
        return;
      }

      if (bot) {
        setSelectedBot({
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private",
          memory_enabled: bot.memory_enabled,
        });
      }
    };

    loadBot();
  }, [selectedBotId]);

  // Load existing chat
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!selectedBotId) return;

      try {
        const { data: existingChat } = await supabase
          .from('chat_history')
          .select('*')
          .eq('bot_id', selectedBotId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingChat) {
          setChatId(existingChat.id);
          // Properly type cast the messages from JSON
          const chatMessages = (existingChat.messages as any[]).map((msg): ChatMessage => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: msg.id || uuidv4()
          }));
          setMessages(chatMessages);
        } else {
          const newChatId = uuidv4();
          setChatId(newChatId);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    };

    loadExistingChat();
  }, [selectedBotId]);

  const saveChatHistory = async (updatedMessages: ChatMessage[]) => {
    try {
      if (!selectedBotId) return;

      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', selectedBotId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const chatData = {
        id: chatId || uuidv4(),
        bot_id: selectedBotId,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString(),
          id: msg.id
        })),
        user_id: (await supabase.auth.getUser()).data.user?.id,
        sequence_number: (latestChat?.sequence_number || 0) + 1,
        messages_used: updatedMessages.filter(msg => msg.role === 'user').length
      };

      if (chatId) {
        const { error } = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', chatId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('chat_history')
          .insert(chatData);

        if (error) throw error;
        setChatId(chatData.id);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  // Convert ChatMessage[] to Message[] for MessageList
  const convertToMessages = (chatMessages: ChatMessage[]): Message[] => {
    return chatMessages.map(msg => ({
      id: msg.id || uuidv4(), // Ensure id is always present
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      isBot: msg.role === 'assistant',
      avatar: msg.role === 'assistant' ? selectedBot?.avatar : undefined
    }));
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="flex justify-end p-4">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={convertToMessages(messages)}
          isLoading={isLoading}
          selectedBot={selectedBot}
          disabled={isExceeded}
          disabledReason={isExceeded ? `Usage limit exceeded. ${resetDate ? `Access will be restored on ${resetDate.toLocaleDateString()}.` : ''}` : undefined}
        />
      </div>
      <div className="p-4">
        <ChatInput
          onSend={async (message: string) => {
            if (!message.trim() || isExceeded) return;
            const newMessage: ChatMessage = {
              role: 'user',
              content: message,
              timestamp: new Date(),
              id: uuidv4()
            };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            await saveChatHistory(updatedMessages);
          }}
          disabled={isLoading || !selectedBot || isExceeded}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Chat;