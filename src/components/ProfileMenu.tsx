import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings, LogOut, CreditCard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export const ProfileMenu = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");

  useEffect(() => {
    fetchUserAvatar();
  }, []);

  const fetchUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First ensure the profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return;
      }

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            role: 'user',
          }]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
      }

      // Now fetch the profile (either existing or newly created)
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.avatar) {
        setAvatarUrl(profile.avatar);
        return;
      }

      // If no custom avatar, check for provider avatar
      const provider = user.app_metadata.provider;
      const providerAvatar = user.user_metadata.avatar_url;

      if (providerAvatar) {
        setAvatarUrl(providerAvatar);
        
        // Update profile with provider avatar if none exists
        const { error } = await supabase
          .from('profiles')
          .update({ avatar: providerAvatar })
          .eq('id', user.id);

        if (error) console.error('Error updating profile avatar:', error);
      }

      // Set initials from email or name
      const name = user.user_metadata.full_name || user.email;
      if (name) {
        const initial = name.charAt(0).toUpperCase();
        setInitials(initial);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={avatarUrl || ''} 
              alt="Profile" 
              className="object-cover"
            />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem 
          onClick={() => navigate('/upgrade')}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          <CreditCard className="h-4 w-4" />
          Upgrade Plan
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2.5"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};