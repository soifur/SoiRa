import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description: string | null;
  short_key: string | null;
  is_public: boolean;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  baseUrl: string;
  onCopy: (text: string, type: string) => void;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  category,
  baseUrl,
  onCopy,
}: ShareDialogProps) => {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Public Link</h3>
            <div className="flex gap-2">
              <Input
                value={`${baseUrl}/category/${category.short_key}`}
                readOnly
              />
              <Button
                onClick={() =>
                  onCopy(
                    `${baseUrl}/category/${category.short_key}`,
                    "Public link"
                  )
                }
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};