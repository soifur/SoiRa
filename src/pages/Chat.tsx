import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useBots } from "@/hooks/useBots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState<string>("");

  const selectedBot = bots.find(bot => bot.id === selectedBotId);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedBot) return;

    try {
      setIsLoading(true);
      const newMessages = [...messages, { role: "user", content: input }];
      setMessages(newMessages);
      setInput("");

      const genAI = new GoogleGenerativeAI(selectedBot.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Start a new chat for each message to ensure instructions are followed
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Send the instructions first, followed by all previous context and the new message
      const fullPrompt = `${selectedBot.instructions}\n\nPrevious messages:\n${
        newMessages
          .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
          .join("\n")
      }`;

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl pt-20">
      <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
        <div className="flex justify-between items-center">
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a bot" />
            </SelectTrigger>
            <SelectContent>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBot && selectedBot.starters.length > 0 && messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedBot.starters.map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => setInput(starter)}
              >
                {starter}
              </Button>
            ))}
          </div>
        )}

        <ScrollArea className="flex-1 rounded-lg border p-4 bg-background">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap m-0">{message.content}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedBot ? "Type your message..." : "Select a bot to start chatting"}
            disabled={isLoading || !selectedBot}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !selectedBot}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;