import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "user";
  created_at: string;
}

export default function Users() {
  const { toast } = useToast();
  const { profile } = useAuth();

  // Only super_admin can access this page
  if (!profile || profile.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching profiles...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log("Fetched profiles:", data);
      return data as Profile[];
    },
  });

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      console.log("Updating role for user:", userId, "to:", newRole);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-red-500">Error loading users. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.role !== "super_admin" && (
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value: "admin" | "user") =>
                        handleRoleChange(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}