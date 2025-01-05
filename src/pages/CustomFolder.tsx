import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { supabase } from "@/integrations/supabase/client";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useChat } from "@/hooks/useChat";
import { useSessionToken } from "@/hooks/useSessionToken";
import { Login } from "@/pages/Login";

const CustomFolder = () => {
  const { backHalf } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const { sessionToken } = useSessionToken();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: folder } = useQuery({
    queryKey: ['folders', backHalf],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('back_half', backHalf)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const { data: folderBots = [] } = useQuery({
    queryKey: ['folder-bots', folder?.id],
    queryFn: async () => {
      if (!folder) return [];
      
      const { data, error } = await supabase
        .from('folder_bots')
        .select(`
          bot_id,
          bots (*)
        `)
        .eq('folder_id', folder.id);

      if (error) throw error;
      return data.map(fb => fb.bots as Bot);
    },
    enabled: !!folder
  });

  const selectedBot = folderBots.find(bot => bot.id === selectedBotId);

  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage
  } = useChat(selectedBot, sessionToken);

  useEffect(() => {
    if (folderBots.length > 0 && !selectedBotId) {
      setSelectedBotId(folderBots[0].id);
    }
  }, [folderBots, selectedBotId]);

  if (!folder) return null;

  // If signups are not allowed and user is not authenticated, show login
  if (!folder.allow_signups && !isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Available Bots</h2>
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

export default CustomFolder;