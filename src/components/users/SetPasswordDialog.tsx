import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SetPasswordDialogProps {
  userId: string;
  trigger: React.ReactNode;
}

export const SetPasswordDialog = ({ userId, trigger }: SetPasswordDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handleSetPassword = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'soifur2@gmail.com') {
        toast({
          title: "Error",
          description: "Only super admin can set user passwords",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIsOpen(false);
      setNewPassword("");
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      console.error('Error setting password:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set New Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSetPassword} className="w-full">
            Set Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};