import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";

interface ChatHeaderProps {
  bots: Bot[];
  selectedBotId: string;
  onBotSelect: (botId: string) => void;
}

export const ChatHeader = ({ bots, selectedBotId, onBotSelect }: ChatHeaderProps) => {
  const { toast } = useToast();

  const handleEmbed = () => {
    if (!selectedBotId) {
      toast({
        title: "No bot selected",
        description: "Please select a bot first",
        variant: "destructive",
      });
      return;
    }
    
    const embedCode = `<iframe
      src="${window.location.origin}/embed/${selectedBotId}"
      width="100%"
      height="600px"
      frameborder="0"
    ></iframe>`;

    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied!",
      description: "The embed code has been copied to your clipboard",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <Select value={selectedBotId} onValueChange={onBotSelect}>
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
      <Button variant="outline" onClick={handleEmbed} disabled={!selectedBotId}>
        <Code className="mr-2 h-4 w-4" />
        Embed
      </Button>
    </div>
  );
};