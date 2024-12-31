import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bot } from "@/hooks/useBots";
import { Link, Globe, Users } from "lucide-react";

interface EmbedOptionsDialogProps {
  bot: Bot;
}

export const EmbedOptionsDialog = ({ bot }: EmbedOptionsDialogProps) => {
  const { toast } = useToast();

  const generateConfig = (type: 'public' | 'link') => {
    const config = {
      id: bot.id,
      name: bot.name,
      instructions: bot.instructions,
      starters: bot.starters,
      model: bot.model,
      apiKey: bot.apiKey,
      openRouterModel: bot.openRouterModel,
      accessType: type
    };
    return encodeURIComponent(JSON.stringify(config));
  };

  const handleCopy = (type: string, isEmbed: boolean) => {
    const config = generateConfig(type as 'public' | 'link');
    const baseUrl = `${window.location.origin}/embed/${bot.id}?config=${config}`;
    const content = isEmbed 
      ? `<iframe src="${baseUrl}" width="100%" height="600px" frameborder="0"></iframe>`
      : baseUrl;

    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied!",
        description: `${isEmbed ? 'Embed code' : 'Link'} has been copied to your clipboard.`,
      });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Link className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Bot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Public Link</h3>
            <div className="flex gap-2">
              <Button onClick={() => handleCopy('public', false)} variant="outline" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={() => handleCopy('public', true)} variant="outline" className="flex-1">
                Copy Embed
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Anyone with Link</h3>
            <div className="flex gap-2">
              <Button onClick={() => handleCopy('link', false)} variant="outline" className="flex-1">
                <Users className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={() => handleCopy('link', true)} variant="outline" className="flex-1">
                Copy Embed
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};