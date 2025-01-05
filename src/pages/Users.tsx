import { useEffect } from "react";
import { MainChatHeader } from "@/components/chat/MainChatHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile, UserRole } from "@/types/user";
import { RoleSelector } from "@/components/users/RoleSelector";
import { UserActions } from "@/components/users/UserActions";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";

const Users = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return profile;
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin'),
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Success",
      description: "User role updated successfully",
    });
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ blocked })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Success",
      description: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
    });
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send reset password email",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password reset email sent successfully",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  if (isLoadingCurrentUser || isLoadingUsers) {
    return (
      <div className="min-h-screen bg-background">
        <MainChatHeader
          selectedBotId={null}
          setSelectedBotId={() => {}}
          bots={[]}
          onNewChat={() => {}}
          onSignOut={() => {}}
          onToggleHistory={() => {}}
          showHistory={false}
        />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const canManageUsers = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-background">
        <MainChatHeader
          selectedBotId={null}
          setSelectedBotId={() => {}}
          bots={[]}
          onNewChat={() => {}}
          onSignOut={() => {}}
          onToggleHistory={() => {}}
          showHistory={false}
        />
        <main className="container mx-auto px-4 py-24">
          <h1 className="text-4xl font-bold mb-8">Unauthorized</h1>
          <p>You don't have permission to access this page.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainChatHeader
        selectedBotId={null}
        setSelectedBotId={() => {}}
        bots={[]}
        onNewChat={() => {}}
        onSignOut={() => {}}
        onToggleHistory={() => {}}
        showHistory={false}
      />
      <main className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Users Management</h1>
          <CreateUserDialog />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <RoleSelector
                      currentRole={user.role}
                      isDisabled={currentUser?.role !== 'super_admin' || user.id === currentUser?.id}
                      onChange={(role) => handleRoleChange(user.id, role)}
                    />
                  </TableCell>
                  <TableCell>{user.blocked ? 'Blocked' : 'Active'}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <UserActions
                      user={user}
                      currentUserId={currentUser?.id}
                      onBlockUser={handleBlockUser}
                      onResetPassword={handleResetPassword}
                      onDeleteUser={handleDeleteUser}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Users;