import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/ProfileMenu";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";

interface ProfileSectionProps {
  showViewPlans?: boolean;
}

export const ProfileSection = ({ showViewPlans = false }: ProfileSectionProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 min-h-[32px]">
          <div className="flex-shrink-0 w-12 h-12">
            <ProfileMenu />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {userProfile?.email?.split('@')[0] || 'User'}
            </span>
          </div>
        </div>
        {showViewPlans && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowUpgradeModal(true)}
          >
            View plans
          </Button>
        )}
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};