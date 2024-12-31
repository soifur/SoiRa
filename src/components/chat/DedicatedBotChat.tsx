import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { Bot } from "@/hooks/useBots";
import { createMessage } from "@/utils/messageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { ChatControls } from "./ChatControls";
import { ChatRecord } from "../archive/types";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./ChatSidebar";
import { sendChatMessage, updateChatHistory } from "@/utils/chatOperations";

interface DedicatedBotChatProps {
  bot: Bot;
}

const DedicatedBotChat = ({ bot }: DedicatedBotChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp?: Date }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, startListening, stopListening, isSpeaking } = useVoiceChat(bot.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, [bot.id]);

  const fetchChatHistory = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('bot_id', bot.id)
        .eq(session.session ? 'user_id' : 'client_id', session.session ? session.session.user.id : 'anonymous')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(record => ({
        id: record.id,
        botId: record.bot_id,
        messages: (record.messages as any[]).map(msg => ({
          id: msg.id || createMessage(msg.role, msg.content).id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          isBot: msg.role === 'assistant'
        })),
        timestamp: record.created_at,
        shareKey: record.share_key,
        type: record.share_key ? 'public' : 'private',
        user_id: record.user_id,
        client_id: record.client_id
      }));
      
      setChatHistory(transformedData);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch chat history",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`dedicated_chat_${bot.id}`);
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      const newUserMessage = createMessage("user", message);
      const newMessages = [...messages, newUserMessage];
      setMessages(newMessages);

      const response = await sendChatMessage(message, newMessages, bot);
      const botResponse = createMessage("assistant", response, true, bot.avatar);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      
      const { data: session } = await supabase.auth.getSession();
      await updateChatHistory(bot.id, updatedMessages, session);
      await fetchChatHistory();
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (chatRecord: ChatRecord) => {
    setSelectedChatId(chatRecord.id);
    setMessages(chatRecord.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
    })));
  };

  return (
    <div className="flex h-full">
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        chatHistory={chatHistory}
        bot={bot}
        onChatSelect={loadChat}
      />

      <div className="flex-1 flex flex-col h-full">
        <ChatHeader
          bot={bot}
          onClearChat={clearChat}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <MessageList
            messages={messages.map(msg => ({
              ...msg,
              isBot: msg.role === 'assistant'
            }))}
            selectedBot={bot}
          />
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-border p-4">
          <ChatControls
            onSend={sendMessage}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            isListening={isListening}
            startListening={startListening}
            stopListening={stopListening}
            showVoiceControls={bot.voice_enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default DedicatedBotChat;