import { useState } from "react";
import { useBots, Bot } from "@/hooks/useBots";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";

interface ChatRecord {
  id: string;
  botId: string;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  timestamp: string;
  shareKey?: string;
  type: string;
}

const Archive = () => {
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("all");
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);

  const getChatHistory = (): ChatRecord[] => {
    try {
      const history = localStorage.getItem("chatHistory");
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  };

  const chatHistory = getChatHistory();
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

  const getChatTitle = (record: ChatRecord) => {
    if (record.type === 'embedded') {
      return `Shared Chat - ${record.shareKey}`;
    }
    const bot = getSelectedBot(record.botId);
    return bot?.name || "Unknown Bot";
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
              <SelectItem value="public">Public Chats</SelectItem>
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
              const firstMessage = record.messages[0];
              
              return (
                <Card 
                  key={index} 
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleChatClick(record)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {record.botId === 'public' ? 'Public Chat' : bot?.name || "Unknown Bot"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(record.timestamp).toLocaleDateString()}
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

      <Dialog open={selectedChat !== null} onOpenChange={() => setSelectedChat(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedChat?.botId === 'public' 
                  ? 'Public Chat History' 
                  : `Chat History - ${getSelectedBot(selectedChat?.botId || '')?.name || 'Unknown Bot'}`}
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
              {selectedChat?.botId !== 'public' && getSelectedBot(selectedChat?.botId || '')?.starters && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-1">Conversation Starters:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {getSelectedBot(selectedChat?.botId || '')?.starters.map((starter, index) => (
                      <li key={index}>{starter}</li>
                    ))}
                  </ul>
                </div>
              )}
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
