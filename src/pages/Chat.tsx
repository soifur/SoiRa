import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { createMessage } from "@/utils/messageUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date; id: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { botId: selectedBotId } = useParams();
  const { toast } = useToast();
  const [chatId, setChatId] = useState<string | null>(null);

  // Load existing chat on mount
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!selectedBotId) return;

      try {
        const { data: existingChat } = await supabase
          .from('chat_history')
          .select('*')
          .eq('bot_id', selectedBotId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (existingChat) {
          setChatId(existingChat.id);
          setMessages(existingChat.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            id: uuidv4()
          })));
        } else {
          // Create a new chat if none exists
          const newChatId = uuidv4();
          setChatId(newChatId);
        }
      } catch (error) {
        console.error("Error loading chat:", error);
      }
    };

    loadExistingChat();
  }, [selectedBotId]);

  const saveChatHistory = async (updatedMessages: typeof messages) => {
    try {
      if (!selectedBotId) return;

      const { data: latestChat } = await supabase
        .from('chat_history')
        .select('sequence_number')
        .eq('bot_id', selectedBotId)
        .order('sequence_number', { ascending: false })
        .limit(1)
        .single();

      const chatData = {
        id: chatId || uuidv4(),
        bot_id: selectedBotId,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        user_id: (await supabase.auth.getUser()).data.user?.id,
        sequence_number: (latestChat?.sequence_number || 0) + 1
      } as Database['public']['Tables']['chat_history']['Insert'];

      if (chatId) {
        // Update existing chat
        const { error } = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', chatId);

        if (error) throw error;
      } else {
        // Insert new chat
        const { error } = await supabase
          .from('chat_history')
          .insert(chatData);

        if (error) throw error;
        setChatId(chatData.id);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = createMessage("user", message);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      const loadingMessage = createMessage("assistant", "...", true);
      setMessages([...newMessages, loadingMessage]);

      // Simulate bot response
      const botResponse = "This is a simulated response."; // Replace with actual bot response logic

      const botMessage = createMessage("assistant", botResponse, true);
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <div className="flex justify-end p-4">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
        />
      </div>
      <div className="p-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading || !selectedBotId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Chat;
