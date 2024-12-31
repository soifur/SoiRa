import { useState } from "react";
import { useBots, Bot } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar } from "lucide-react";

interface ChatRecord {
  botId: string;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
}

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  // Get chat history from localStorage
  const getChatHistory = (): ChatRecord[] => {
    const history = localStorage.getItem("chatHistory");
    return history ? JSON.parse(history) : [];
  };

  const chatHistory = getChatHistory();
  const filteredHistory = selectedBotId 
    ? chatHistory.filter(record => record.botId === selectedBotId)
    : chatHistory;

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
              <SelectItem value="">All Bots</SelectItem>
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
              const bot = bots.find(b => b.id === record.botId);
              const lastMessage = record.messages[record.messages.length - 1];
              const firstMessage = record.messages[0];
              
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{bot?.name || "Unknown Bot"}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(firstMessage.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {record.messages.length} messages
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(lastMessage.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Latest message: {lastMessage.content.slice(0, 100)}...
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Archive;