import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MessageList } from "@/components/chat/MessageList";
import { ChatService } from "@/services/ChatService";
import { Bot } from "@/hooks/useBots";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Menu } from "lucide-react";
import { createMessage, formatMessages } from "@/utils/messageUtils";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { ChatControls } from "./ChatControls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatListItem } from "../archive/ChatListItem";
import { ChatRecord } from "../archive/types";

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
      setChatHistory(data || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`dedicated_chat_${bot.id}`);
    toast({
      title: "Chat Cleared",
      description: "The chat history has been cleared.",
    });
  };

  const updateChatHistory = async (updatedMessages: typeof messages) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      let clientId = 'anonymous';
      
      try {
        const { data: { user_ip } } = await supabase.functions.invoke('get-client-ip');
        if (user_ip) {
          clientId = user_ip;
        }
      } catch (error) {
        console.warn("Could not get client IP, using anonymous:", error);
      }

      const chatData = {
        bot_id: bot.id,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp?.toISOString()
        })),
        ...(session.session 
          ? { user_id: session.session.user.id }
          : { client_id: clientId }
        )
      };

      let error;
      if (selectedChatId) {
        ({ error } = await supabase
          .from('chat_history')
          .update(chatData)
          .eq('id', selectedChatId));
      } else {
        ({ error } = await supabase
          .from('chat_history')
          .insert(chatData));
      }

      if (error) throw error;
      
      await fetchChatHistory();
    } catch (error) {
      console.error("Error saving chat history:", error);
      toast({
        title: "Error",
        description: "Failed to save chat history",
        variant: "destructive",
      });
    }
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
      await updateChatHistory(updatedMessages);
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
        <div className="border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <img
                src={bot.avatar || "/placeholder.svg"}
                alt={bot.name}
                className="w-8 h-8 rounded-full"
              />
              <h1 className="text-xl font-semibold">{bot.name}</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
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