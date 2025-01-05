import { useState, useEffect } from "react";
import { useBots } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { createMessage } from "@/utils/messageUtils";
import { ChatListItem } from "@/components/archive/ChatListItem";
import { ChatDialog } from "@/components/archive/ChatDialog";
import { ChatRecord } from "@/components/archive/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('deleted', 'no')
        .or(`user_id.eq.${session.session?.user.id},share_key.not.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedHistory = data.map((record, index): ChatRecord => ({
        id: record.id,
        botId: record.bot_id,
        messages: (record.messages as any[]).map(msg => ({
          id: msg.id || createMessage(msg.role, msg.content).id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isBot: msg.role === 'assistant'
        })),
        timestamp: record.created_at,
        shareKey: record.share_key,
        type: record.share_key ? 'public' : 'private',
        user_id: record.user_id,
        client_id: record.client_id,
        sequence_number: data.length - index
      }));

      setChatHistory(transformedHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      const { error } = await supabase
        .from('chat_history')
        .update({ deleted: 'yes' })
        .eq('id', chatId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      fetchChatHistory();
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const filteredHistory = selectedBotId === "all"
    ? chatHistory
    : chatHistory.filter(record => record.botId === selectedBotId);

  const getSelectedBot = (botId: string) => {
    return bots.find(b => b.id === botId);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat Archive
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              View and manage your chat history
            </p>
          </div>
        </div>
        <Card className="flex items-center gap-2 p-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className={`${isMobile ? 'w-[140px]' : 'w-[200px]'} border-none`}>
              <SelectValue placeholder="Filter by bot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chats</SelectItem>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 p-4 text-center">
            <Bot className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No chats found</h3>
              <p className="text-sm text-muted-foreground">
                {selectedBotId === "all" 
                  ? "Your chat archive is empty"
                  : "No chats found for this bot"}
              </p>
            </div>
            <Button onClick={() => navigate("/")} variant="outline">
              Start a new chat
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4 max-w-4xl mx-auto">
              {filteredHistory.map((record) => (
                <ChatListItem
                  key={record.id}
                  record={record}
                  bot={getSelectedBot(record.botId)}
                  onClick={() => setSelectedChat(record)}
                  onDelete={() => handleDeleteChat(record.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <ChatDialog
        chat={selectedChat}
        bot={selectedChat ? getSelectedBot(selectedChat.botId) : undefined}
        onClose={() => setSelectedChat(null)}
      />
    </div>
  );
};

export default Archive;