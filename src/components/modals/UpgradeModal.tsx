import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Upgrade your plan to get access to more features and higher usage limits.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Add your subscription tiers and payment integration here */}
          <p>Contact us to learn more about our premium plans.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};