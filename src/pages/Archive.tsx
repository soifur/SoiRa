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

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .or(`user_id.eq.${session.session?.user.id},share_key.not.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedHistory = data.map((record): ChatRecord => ({
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
        client_id: record.client_id
      }));

      setChatHistory(transformedHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
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
    <div className="container mx-auto max-w-6xl pt-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Chat Archive</h1>
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className="w-[200px]">
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
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="space-y-4">
            {filteredHistory.map((record) => (
              <ChatListItem
                key={record.id}
                record={record}
                bot={getSelectedBot(record.botId)}
                onClick={() => setSelectedChat(record)}
              />
            ))}
          </div>
        </ScrollArea>
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