import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GroupedChatRecord } from "@/components/archive/types";
import { transformChatHistory, groupChatsByClient } from "@/utils/chatTransformUtils";

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<GroupedChatRecord[]>([]);
  const { toast } = useToast();

  const fetchChatHistory = async () => {
    try {
      console.log("Fetching chat history...");
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching chat history:", error);
        throw error;
      }

      console.log("Raw chat history data:", data);

      if (!data || data.length === 0) {
        console.log("No chat history found");
        setChatHistory([]);
        return;
      }

      const transformedHistory = transformChatHistory(data);
      console.log("Transformed history:", transformedHistory);

      const groupedChats = groupChatsByClient(transformedHistory);
      console.log("Final grouped chats:", groupedChats);
      
      setChatHistory(groupedChats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  return { chatHistory };
};