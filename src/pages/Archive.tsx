import { useState } from "react";
import { useBots } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatListItem } from "@/components/archive/ChatListItem";
import { ChatDialog } from "@/components/archive/ChatDialog";
import { ChatRecord } from "@/components/archive/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useChatHistory } from "@/hooks/useChatHistory";

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const { chatHistory } = useChatHistory();

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