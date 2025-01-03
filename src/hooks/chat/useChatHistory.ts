import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/chat/types/chatTypes";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/components/ui/use-toast";

export const useChatHistory = (
  botId: string,
  clientId: string,
  shareKey?: string,
  sessionToken?: string | null
) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadExistingChat = async (specificChatId?: string) => {
    if (!botId || !sessionToken) return;

    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('bot_id', botId)
        .eq('session_token', sessionToken)
        .eq('deleted', 'no');

      if (specificChatId) {
        query = query.eq('id', specificChatId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data: existingChat, error } = await query.single();

      if (error && !specificChatId) {
        console.log("No existing chat found, creating new one");
        await createNewChat();
        return [];
      }

      if (existingChat) {
        console.log("Found existing chat for session:", sessionToken);
        setChatId(existingChat.id);
        return Array.isArray(existingChat.messages) 
          ? existingChat.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
              id: msg.id || uuidv4()
            }))
          : [];
      } else if (!specificChatId) {
        await createNewChat();
      }
      return [];
    } catch (error) {
      console.error("Error loading chat:", error);
      if (!specificChatId) {
        await createNewChat();
      }
      return [];
    }
  };

  const createNewChat = async () => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);
      setChatId(newChatId);
      return newChatId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveChatHistory = async (messages: Message[], currentChatId: string) => {
    if (!sessionToken) return;

    try {
      const messagesToSave = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toISOString()
      }));

      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', botId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const nextSequence = (latestChat?.sequence_number || 0) + 1;

      const { error } = await supabase
        .from('chat_history')
        .upsert({
          id: currentChatId,
          bot_id: botId,
          messages: messagesToSave,
          client_id: clientId,
          share_key: shareKey,
          session_token: sessionToken,
          sequence_number: nextSequence,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  return {
    chatId,
    loadExistingChat,
    createNewChat,
    saveChatHistory
  };
};