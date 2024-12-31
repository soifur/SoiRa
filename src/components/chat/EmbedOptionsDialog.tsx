import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot } from "@/hooks/useBots";
import { createShortBotConfig } from "@/utils/urlUtils";
import { useToast } from "@/components/ui/use-toast";

interface EmbedOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Bot | null;
}

export const EmbedOptionsDialog = ({ isOpen, onClose, bot }: EmbedOptionsDialogProps) => {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  
  if (!bot) {
    return null;
  }
  
  const shortConfig = createShortBotConfig(bot);
  const publicLink = `${baseUrl}/embed/${bot.id}?config=${shortConfig}`;
  const embedCode = `<iframe src="${publicLink}" width="100%" height="600px" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} has been copied to clipboard`,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share or Embed Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Public Link</h3>
            <div className="flex gap-2">
              <Input value={publicLink} readOnly />
              <Button onClick={() => copyToClipboard(publicLink, "Public link")}>
                Copy
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Embed Code</h3>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly />
              <Button onClick={() => copyToClipboard(embedCode, "Embed code")}>
                Copy
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};