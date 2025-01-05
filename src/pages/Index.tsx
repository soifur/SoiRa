import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
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
import { Message } from "@/components/chat/types/chatTypes";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionToken } = useSessionToken();

  const { data: userBots = [], isLoading: isLoadingUserBots } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('published', true)
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
        published: bot.published,
      }));
    }
  });

  const { data: sharedBots = [], isLoading: isLoadingSharedBots } = useQuery({
    queryKey: ['shared-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_bots')
        .select('*')
        .eq('published', true)
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
      apiKey: "",
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
    setMessages([]);
    setCurrentChatId(null);
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
        const typedMessages = (chat.messages as any[]).map((msg): Message => ({
          id: msg.id || uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          isBot: msg.isBot,
          avatar: msg.avatar
        }));
        setMessages(typedMessages);
        setCurrentChatId(selectedChatId);
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
      setIsStreaming(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "", true);
      setMessages([...newMessages, loadingMessage]);

      let response = "";
      if (selectedBot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(
          newMessages,
          selectedBot,
          undefined,
          (chunk: string) => {
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + chunk }
                ];
              }
              return prev;
            });
          }
        );
      } else if (selectedBot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, selectedBot);
        const botMessage = createMessage("assistant", response);
        setMessages([...newMessages, botMessage]);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate a new chatId only if we don't have one (new chat)
      const chatId = currentChatId || uuidv4();
      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      const chatData = {
        id: chatId,
        bot_id: selectedBot.id,
        messages: [...newMessages, createMessage("assistant", response)].map(msg => ({
          ...msg,
          timestamp: msg.timestamp?.toISOString(),
        })),
        user_id: user?.id,
        session_token: !user ? sessionToken : null,
        sequence_number: 1,
        updated_at: new Date().toISOString()
      };

      // Use upsert instead of insert
      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData);

      if (error) throw error;

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
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
              currentChatId={currentChatId}
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              setSelectedBotId={setSelectedBotId}
            />
            <ChatContainer
              selectedBot={selectedBot}
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;