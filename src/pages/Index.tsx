import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useQuery } from "@tanstack/react-query";
import { Bot as BotType } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import { MainChatHistory } from "@/components/chat/MainChatHistory";
import { ChatService } from "@/services/ChatService";
import { createMessage } from "@/utils/messageUtils";
import { v4 as uuidv4 } from 'uuid';
import { useSessionToken } from "@/hooks/useSessionToken";
import { Message, ChatHistoryData } from "@/components/chat/types/chatTypes";

// Since this file is quite long (223 lines), let's split it into smaller components
// First, let's extract the chat functionality into a separate component
const ChatSection = ({ selectedBot, messages, isLoading, sendMessage }: {
  selectedBot: BotType | undefined;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => void;
}) => {
  return (
    <>
      <div className="flex-1 overflow-hidden mt-14 mb-24">
        {selectedBot ? (
          <MessageList
            messages={messages}
            selectedBot={selectedBot}
            starters={selectedBot.starters || []}
            onStarterClick={sendMessage}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a model to start chatting
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            onSend={sendMessage}
            disabled={!selectedBot}
            isLoading={isLoading}
            placeholder={selectedBot ? "Type your message..." : "Select a model to start chatting"}
          />
        </div>
      </div>
    </>
  );
};

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatId] = useState(() => uuidv4());
  const { sessionToken } = useSessionToken();

  // Query for user's bots
  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      return data.map((bot): BotType => ({
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
      }));
    }
  });

  // Query for shared bots
  const { data: sharedBots = [], isLoading: isLoadingSharedBots } = useQuery({
    queryKey: ['shared-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const allBots = [
    ...(userBots || []),
    ...(sharedBots || []).map(shared => ({
      id: shared.share_key,
      name: `${shared.bot_name} (Shared)`,
      instructions: shared.instructions || "",
      starters: shared.starters || [],
      model: shared.model as BotType['model'],
      apiKey: "", // API key is handled separately for shared bots
      openRouterModel: shared.open_router_model,
      avatar: shared.avatar,
      accessType: "public" as const,
      memory_enabled: shared.memory_enabled,
    }))
  ];

  const selectedBot = allBots.find(bot => bot.id === selectedBotId);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleNewChat = () => {
    setSelectedBotId(null);
    setMessages([]);
    toast({
      title: "New Chat",
      description: "Starting a new chat session",
    });
  };

  const handleSelectChat = async (selectedChatId: string) => {
    try {
      const { data: chat } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', selectedChatId)
        .single();

      if (chat && chat.messages) {
        const typedMessages = (chat.messages as Message[]).map((msg: Message) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          id: msg.id || uuidv4()
        }));
        setMessages(typedMessages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (message: string) => {
    if (!selectedBot || !message.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "...", true);
      setMessages([...newMessages, loadingMessage]);

      let response: string;
      if (selectedBot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, selectedBot);
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
      } else {
        throw new Error("Unsupported model type");
      }

      const botMessage = createMessage("assistant", response, true);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      await saveChatHistory(updatedMessages, selectedBot);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatHistory = async (messages: Message[], bot: BotType) => {
    try {
      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', bot.id)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (latestChat?.sequence_number || 0) + 1;

      const chatData: Partial<ChatHistoryData> = {
        id: chatId,
        bot_id: bot.id,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toISOString(),
        })),
        sequence_number: nextSequenceNumber,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full">
            <MainChatHeader
              selectedBotId={selectedBotId}
              setSelectedBotId={setSelectedBotId}
              bots={allBots}
              onNewChat={handleNewChat}
              onSignOut={handleSignOut}
              onToggleHistory={() => setShowHistory(!showHistory)}
              showHistory={showHistory}
            />
            <MainChatHistory
              sessionToken={sessionToken}
              botId={selectedBotId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              currentChatId={chatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
            />
            <ChatSection
              selectedBot={selectedBot}
              messages={messages}
              isLoading={isLoading}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;