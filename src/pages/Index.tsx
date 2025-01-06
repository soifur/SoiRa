import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MainChat } from "@/components/chat/MainChat";
import { useBotProvider } from "@/components/chat/BotProvider";

const Index = () => {
  const navigate = useNavigate();
  const { data: allBots = [], isLoading: isLoadingBots } = useBotProvider();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Card className="w-full h-[100dvh] overflow-hidden relative">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">
            <MainChat
              allBots={allBots}
              isLoadingBots={isLoadingBots}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;