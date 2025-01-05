import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useChat } from "@/hooks/useChat";
import { useSessionToken } from "@/hooks/useSessionToken";

const FolderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const { sessionToken } = useSessionToken();
  const [isAddBotOpen, setIsAddBotOpen] = useState(false);

  // Fetch folder details
  const { data: folder } = useQuery({
    queryKey: ['folders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch folder bots
  const { data: folderBots = [] } = useQuery({
    queryKey: ['folder-bots', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folder_bots')
        .select(`
          bot_id,
          bots (*)
        `)
        .eq('folder_id', id);

      if (error) throw error;
      
      return data.map(fb => {
        const bot = fb.bots;
        return {
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private" as const,
          memory_enabled: bot.memory_enabled,
        } as Bot;
      });
    }
  });

  // Fetch available bots for adding
  const { data: availableBots = [] } = useQuery({
    queryKey: ['available-bots'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      const folderBotIds = new Set(folderBots.map(bot => bot.id));
      return data
        .filter(bot => !folderBotIds.has(bot.id))
        .map(bot => ({
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions || "",
          starters: bot.starters || [],
          model: bot.model,
          apiKey: bot.api_key,
          openRouterModel: bot.open_router_model,
          avatar: bot.avatar,
          accessType: "private" as const,
          memory_enabled: bot.memory_enabled,
        }));
    },
    enabled: isAddBotOpen
  });

  // Add bot to folder mutation
  const addBotToFolder = useMutation({
    mutationFn: async (botId: string) => {
      const { error } = await supabase
        .from('folder_bots')
        .insert({
          folder_id: id,
          bot_id: botId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-bots', id] });
      setIsAddBotOpen(false);
      toast({
        title: "Success",
        description: "Bot added to folder successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add bot to folder",
        variant: "destructive",
      });
      console.error("Error adding bot to folder:", error);
    }
  });

  const selectedBot = folderBots.find(bot => bot.id === selectedBotId);

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage
  } = useChat(selectedBot, sessionToken);

  // Set first bot as selected when folder bots load
  useEffect(() => {
    if (folderBots.length > 0 && !selectedBotId) {
      setSelectedBotId(folderBots[0].id);
    }
  }, [folderBots, selectedBotId]);

  if (!folder) return null;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/folders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{folder.title}</h1>
            {folder.description && (
              <p className="text-muted-foreground">{folder.description}</p>
            )}
          </div>
        </div>
        <Dialog open={isAddBotOpen} onOpenChange={setIsAddBotOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bot to Folder</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] mt-4">
              <div className="space-y-2">
                {availableBots.map((bot) => (
                  <Card
                    key={bot.id}
                    className="p-4 cursor-pointer hover:bg-accent"
                    onClick={() => addBotToFolder.mutate(bot.id)}
                  >
                    <h3 className="font-semibold">{bot.name}</h3>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Folder Bots</h2>
            <div className="space-y-2">
              {folderBots.map((bot) => (
                <Card
                  key={bot.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedBotId === bot.id ? 'bg-accent' : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedBotId(bot.id)}
                >
                  <h3 className="font-semibold">{bot.name}</h3>
                </Card>
              ))}
            </div>
          </Card>
        </div>
        <div className="col-span-9">
          {selectedBot && (
            <Card className="h-[calc(100vh-12rem)]">
              <ChatContainer
                selectedBot={selectedBot}
                messages={messages}
                isLoading={isLoading}
                isStreaming={isStreaming}
                sendMessage={sendMessage}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderDetail;
