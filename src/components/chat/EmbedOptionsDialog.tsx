import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot } from "@/hooks/useBots";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface EmbedOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Bot | null;
}

export const EmbedOptionsDialog = ({ isOpen, onClose, bot }: EmbedOptionsDialogProps) => {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const [shareKey, setShareKey] = useState<string>("");
  
  useEffect(() => {
    if (bot && isOpen) {
      const newShareKey = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      setShareKey(newShareKey);
      
      try {
        const shareConfig = {
          id: bot.id,
          name: bot.name,
          instructions: bot.instructions,
          starters: bot.starters,
          model: bot.model,
          openRouterModel: bot.openRouterModel,
          avatar: bot.avatar,
          accessType: "public",
        };
        localStorage.setItem(`share_${newShareKey}`, JSON.stringify(shareConfig));
        console.log("Stored share configuration:", shareConfig);
      } catch (error) {
        console.error("Error storing share configuration:", error);
        toast({
          title: "Error",
          description: "Failed to create share configuration",
          variant: "destructive",
        });
      }
    }
  }, [bot, isOpen, toast]);

  const publicLink = `${baseUrl}/embed/${shareKey}`;
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
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share or Embed Chat
          </DialogTitle>
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