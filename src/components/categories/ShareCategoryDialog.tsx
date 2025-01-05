import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { BotCategory } from "@/types/categoryTypes";
import { useToast } from "@/components/ui/use-toast";

interface ShareCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: BotCategory;
}

export const ShareCategoryDialog = ({ isOpen, onClose, category }: ShareCategoryDialogProps) => {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/embed/category/${category.short_key}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Category
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Share Link</h3>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={() => copyToClipboard(shareUrl)}>
                Copy
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};