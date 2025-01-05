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

export const MainChatHeader = ({ bots, selectedBotId, onBotSelect }: ChatHeaderProps) => {
  const { toast } = useToast();
  // Filter to only show published bots (those with a model)
  const publishedBots = bots.filter(bot => bot.model);

  const handleEmbed = () => {
    if (!selectedBotId) {
      toast({
        title: "No model selected",
        description: "Please select a model first",
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
    <div className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center px-4">
        <div className="flex-1 flex items-center gap-4">
          <Select value={selectedBotId} onValueChange={onBotSelect}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {publishedBots.map((bot) => (
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
      </div>
    </div>
  );
};