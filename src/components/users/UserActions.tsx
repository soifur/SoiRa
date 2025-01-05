import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { UserProfile } from "@/types/user";
import { SetPasswordDialog } from "./SetPasswordDialog";

interface UserActionsProps {
  user: UserProfile;
  currentUserId: string;
  onBlockUser: (userId: string, blocked: boolean) => void;
  onResetPassword: (email: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserActions = ({
  user,
  currentUserId,
  onBlockUser,
  onResetPassword,
  onDeleteUser,
}: UserActionsProps) => {
  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isCurrentUser && (
            <>
              <SetPasswordDialog
                userId={user.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Set Password
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem onSelect={() => onBlockUser(user.id, !user.blocked)}>
                {user.blocked ? 'Unblock User' : 'Block User'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onResetPassword(user.email)}>
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => onDeleteUser(user.id)}
              >
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};