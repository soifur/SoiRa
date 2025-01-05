import { useState } from "react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useQuery } from "@tanstack/react-query";
import { Bot as BotType } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { History, Plus, Sun, Moon, Settings, LogOut, Bot as BotIcon, Archive, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch bots
  const { data: bots, isLoading: isLoadingBots } = useQuery({
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

  const selectedBot = bots?.find(bot => bot.id === selectedBotId) || null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleNewChat = () => {
    // Implement new chat functionality
    toast({
      title: "New Chat",
      description: "Starting a new chat session",
    });
  };

  if (isLoadingBots) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full">
            <div className="absolute top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="h-14 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate('/archive')}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate('/bots')}
                  >
                    <BotIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate('/archive')}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={selectedBotId || ""} onValueChange={setSelectedBotId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a bot" />
                  </SelectTrigger>
                  <SelectContent>
                    {bots?.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-8 w-8"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/settings')}
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNewChat}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden mt-14 mb-24">
              {selectedBot ? (
                <MessageList
                  messages={[]}
                  selectedBot={selectedBot}
                  starters={selectedBot.starters || []}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select a bot to start chatting
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSend={() => {}}
                  disabled={!selectedBot}
                  isLoading={false}
                  placeholder={selectedBot ? "Type your message..." : "Select a bot to start chatting"}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;