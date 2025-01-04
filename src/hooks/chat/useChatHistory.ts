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
    if (!botId || !sessionToken) return [];

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

      const { data: existingChat, error } = await query.maybeSingle();

      if (error) {
        console.error("Error loading chat:", error);
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
      }
      return [];
    } catch (error) {
      console.error("Error loading chat:", error);
      return [];
    }
  };

  const createNewChat = async () => {
    if (!sessionToken) return null;
    
    try {
      console.log("Creating new chat for session:", sessionToken);
      const newChatId = uuidv4();
      console.log("Generated new chat ID:", newChatId);

      // Get the next sequence number
      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', botId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSequence = (latestChat?.sequence_number || 0) + 1;

      const { error } = await supabase
        .from('chat_history')
        .insert({
          id: newChatId,
          bot_id: botId,
          messages: [],
          client_id: clientId,
          share_key: shareKey,
          session_token: sessionToken,
          sequence_number: nextSequence
        });

      if (error) throw error;
      
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
    if (!sessionToken || !currentChatId) {
      console.error("Missing required data for saving chat history");
      return;
    }

    try {
      console.log("Saving chat history with", messages.length, "messages");
      
      // Ensure messages are properly formatted for JSONB storage
      const messagesToSave = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp?.toISOString(),
        avatar: msg.avatar
      }));

      console.log("Formatted messages for save:", messagesToSave);

      const { error } = await supabase
        .from('chat_history')
        .update({
          messages: messagesToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentChatId)
        .eq('session_token', sessionToken);

      if (error) {
        console.error("Error saving chat history:", error);
        throw error;
      }
      
      console.log("Successfully saved chat history");
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