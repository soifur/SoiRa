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
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProfile {
  first_name: string | null;
  email: string | null;
}

export const ProfileMenu = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isMobile = useIsMobile();

  const fetchUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return;
      }

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar, first_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile({
          first_name: profile.first_name,
          email: profile.email
        });
        
        if (profile.avatar) {
          setAvatarUrl(profile.avatar);
          return;
        }
      }

      const provider = user.app_metadata.provider;
      const providerAvatar = user.user_metadata.avatar_url;

      if (providerAvatar) {
        setAvatarUrl(providerAvatar);
        
        const { error } = await supabase
          .from('profiles')
          .update({ avatar: providerAvatar })
          .eq('id', user.id);

        if (error) console.error('Error updating profile avatar:', error);
      }

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

  useEffect(() => {
    fetchUserAvatar();
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full h-full p-0 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3 p-4 w-full">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={avatarUrl || ''} 
                  alt="Profile" 
                  className="object-cover"
                />
                <AvatarFallback className="text-base">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium leading-none">
                  {userProfile?.first_name || userProfile?.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center"
          className={`${isMobile ? 'w-[calc(100vw-2rem)] mx-auto' : 'w-48'}`}
          style={{ 
            position: 'fixed',
            left: isMobile ? '50%' : undefined,
            transform: isMobile ? 'translateX(-50%)' : undefined,
          }}
        >
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
            onClick={() => setShowUpgradeModal(true)}
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
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};