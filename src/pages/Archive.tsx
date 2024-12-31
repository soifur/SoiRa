import { useState, useEffect } from "react";
import { useBots, Bot } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/components/chat/MessageList";
import { createMessage } from "@/utils/messageUtils";

interface ChatRecord {
  id: string;
  botId: string;
  messages: Message[];
  timestamp: string;
  shareKey?: string;
  type: string;
  user_id?: string;
}

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
      
      // Fetch both user's chats and public chats
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .or(`user_id.eq.${session.session?.user.id},share_key.is.not.null`)
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
        user_id: record.user_id
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

  const handleChatClick = (chat: ChatRecord) => {
    setSelectedChat(chat);
  };

  const getSelectedBot = (botId: string): Bot | undefined => {
    if (!botId) return undefined;
    return bots.find(b => b.id === botId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {filteredHistory.map((record, index) => {
              const bot = getSelectedBot(record.botId);
              const lastMessage = record.messages[record.messages.length - 1];
              
              return (
                <Card 
                  key={index} 
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleChatClick(record)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {bot?.name || "Unknown Bot"}
                      </span>
                      {record.shareKey && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {record.messages.length} messages
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {lastMessage?.timestamp ? formatDate(lastMessage.timestamp.toString()) : 'No messages'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Latest message: {lastMessage?.content ? `${lastMessage.content.slice(0, 100)}...` : 'No messages'}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={selectedChat !== null} onOpenChange={() => setSelectedChat(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {getSelectedBot(selectedChat?.botId || '')?.name || 'Chat History'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChat(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {formatDate(selectedChat?.timestamp || '')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="space-y-4">
              {selectedChat?.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.content}
                  isBot={message.role === 'assistant'}
                  avatar={getSelectedBot(selectedChat.botId)?.avatar}
                />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Archive;