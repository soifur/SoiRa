import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMessage, formatMessages } from "@/utils/messageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { ChatControls } from "./ChatControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListItem } from "../archive/ChatListItem";
import { ChatRecord, SupabaseChatRecord } from "../archive/types";
import { updateChatHistory } from "@/utils/chatUtils";
import { ChatHeader } from "./ChatHeader";

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

  const transformSupabaseChatRecord = (record: SupabaseChatRecord): ChatRecord => ({
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
  });

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
      
      const transformedData = (data || []).map(transformSupabaseChatRecord);
      setChatHistory(transformedData);
    } catch (error) {
      console.error("Error fetching chat history:", error);
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

      let response: string;

      if (bot.model === "openrouter") {
        response = await ChatService.sendOpenRouterMessage(newMessages, bot);
      } else if (bot.model === "gemini") {
        response = await ChatService.sendGeminiMessage(newMessages, bot);
      } else {
        throw new Error("Unsupported model type");
      }

      const botResponse = createMessage("assistant", response, true, bot.avatar);
      const updatedMessages = [...newMessages, botResponse];
      
      setMessages(updatedMessages);
      
      const { data: session } = await supabase.auth.getSession();
      await updateChatHistory(
        bot.id,
        updatedMessages,
        session.session?.user.id
      );
      
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
      {/* Sidebar */}
      <div className={`border-r border-border ${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  record={chat}
                  bot={bot}
                  onClick={() => loadChat(chat)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatHeader
          bot={bot}
          onClearChat={clearChat}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <MessageList
            messages={formatMessages(messages)}
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