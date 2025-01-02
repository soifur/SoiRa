import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/types/chatTypes";
import { useToast } from "@/components/ui/use-toast";

export const useChatPersistence = () => {
  const { toast } = useToast();

  const saveChatHistory = async (
    messages: Message[],
    chatId: string,
    botId: string,
    sessionToken: string | null,
    userId: string | null,
    clientId: string | null
  ) => {
    try {
      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', botId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequenceNumber = (latestChat?.sequence_number || 0) + 1;

      const supabaseMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString(),
      }));

      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: chatId,
          bot_id: botId,
          messages: supabaseMessages,
          sequence_number: nextSequenceNumber,
          client_id: clientId,
          session_token: sessionToken,
          user_id: userId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving chat history:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in saveChatHistory:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  return { saveChatHistory };
};