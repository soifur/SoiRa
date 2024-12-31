import { useState, useEffect } from "react";
import { useBots } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { createMessage } from "@/utils/messageUtils";
import { ChatListItem } from "@/components/archive/ChatListItem";
import { ChatDialog } from "@/components/archive/ChatDialog";
import { ChatRecord, GroupedChatRecord } from "@/components/archive/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { isDatabaseMessage } from "@/types/database";

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [chatHistory, setChatHistory] = useState<GroupedChatRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      console.log("Fetching chat history...");
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching chat history:", error);
        throw error;
      }

      console.log("Raw chat history data:", data);

      if (!data || data.length === 0) {
        console.log("No chat history found");
        setChatHistory([]);
        return;
      }

      const transformedHistory = data.map((record): ChatRecord => {
        console.log("Processing record:", record);
        
        // Ensure messages is an array and handle potential parsing
        let messagesArray = [];
        try {
          if (typeof record.messages === 'string') {
            messagesArray = JSON.parse(record.messages);
          } else if (Array.isArray(record.messages)) {
            messagesArray = record.messages;
          } else if (record.messages && typeof record.messages === 'object') {
            messagesArray = [record.messages];
          }
        } catch (e) {
          console.error("Error parsing messages:", e);
          messagesArray = [];
        }

        // Transform and validate each message
        const messages = messagesArray
          .filter(msg => {
            const isValid = isDatabaseMessage(msg);
            if (!isValid) {
              console.warn("Invalid message format:", msg);
            }
            return isValid;
          })
          .map(msg => ({
            id: msg.id || createMessage(msg.role, msg.content).id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            isBot: msg.role === 'assistant'
          }));

        console.log("Transformed messages:", messages);

        return {
          id: record.id,
          botId: record.bot_id,
          messages,
          timestamp: record.created_at || new Date().toISOString(),
          shareKey: record.share_key,
          type: record.share_key ? 'public' : 'private',
          user_id: record.user_id,
          client_id: record.client_id || 'unknown'
        };
      });

      console.log("Transformed history:", transformedHistory);

      // Group chats by client_id
      const groupedChats = transformedHistory.reduce((acc: GroupedChatRecord[], chat) => {
        const existingGroup = acc.find(
          group => group.clientId === chat.client_id
        );

        if (existingGroup) {
          existingGroup.chats.push(chat);
          if (chat.timestamp > existingGroup.latestTimestamp) {
            existingGroup.latestTimestamp = chat.timestamp;
          }
        } else {
          acc.push({
            clientId: chat.client_id || 'unknown',
            botId: chat.botId,
            chats: [chat],
            latestTimestamp: chat.timestamp
          });
        }
        return acc;
      }, []);

      // Sort groups by latest timestamp
      groupedChats.sort((a, b) => 
        new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
      );

      // Sort chats within each group by timestamp
      groupedChats.forEach(group => {
        group.chats.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });

      console.log("Final grouped chats:", groupedChats);
      setChatHistory(groupedChats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
        variant: "destructive",
      });
    }
  };

  const filteredHistory = chatHistory
    .filter(group => {
      const matchesBot = selectedBotId === "all" || group.botId === selectedBotId;
      const matchesSearch = searchTerm === "" || group.chats.some(chat => 
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      return matchesBot && matchesSearch;
    });

  const getSelectedBot = (botId: string) => {
    return bots.find(b => b.id === botId);
  };

  return (
    <div className={`container mx-auto max-w-6xl ${isMobile ? 'pt-4 px-2' : 'pt-20'}`}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Chat Archive</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[200px]'}`}>
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
        </div>
        
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-12rem)]' : 'h-[calc(100vh-14rem)]'}`}>
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchTerm || selectedBotId !== "all" 
                  ? "No chats found matching your filters"
                  : "No chat history available"}
              </div>
            ) : (
              filteredHistory.map((group) => (
                <div key={`${group.clientId}`} className="space-y-2">
                  <div className="font-medium text-sm text-muted-foreground">
                    IP: {group.clientId}
                  </div>
                  {group.chats.map((record) => (
                    <ChatListItem
                      key={record.id}
                      record={record}
                      bot={getSelectedBot(record.botId)}
                      onClick={() => setSelectedChat(record)}
                    />
                  ))}
                </div>
              ))
            )}
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