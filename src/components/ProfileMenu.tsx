import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "./profile/ProfileAvatar";
import { ProfileMenuItems } from "./profile/ProfileMenuItems";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileMenuProps {
  fullName?: string;
}

export const ProfileMenu = ({ fullName }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string>("U");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
    setOpen(false); // Close the dropdown when opening the upgrade modal
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div className="custom-profile-menu p-4 hover:bg-accent/0 transition-colors cursor-pointer bg-transparent">
            <div className="flex items-center gap-3">
              <ProfileAvatar avatarUrl={avatarUrl} initials={initials} />
              {fullName && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {fullName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={cn(
            "custom-profile-menu-content bg-background border",
            isMobile ? 'w-[calc(100vw-2rem)]' : 'w-48'
          )}
        >
          <ProfileMenuItems 
            onUpgrade={handleUpgrade}
            onLogout={handleLogout}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};
