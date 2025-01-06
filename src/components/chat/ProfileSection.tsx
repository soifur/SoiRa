import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/ProfileMenu";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";

interface ProfileSectionProps {
  showViewPlans?: boolean;
  onClose?: () => void;
}

export const ProfileSection = ({ showViewPlans = false, onClose }: ProfileSectionProps) => {
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

  const fullName = [userProfile?.first_name, userProfile?.last_name]
    .filter(Boolean)
    .join(' ') || userProfile?.email?.split('@')[0] || 'User';

  const handleViewPlans = () => {
    if (onClose) {
      onClose();
    }
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div className="flex flex-col border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {showViewPlans && (
          <button
            onClick={handleViewPlans}
            className="w-full p-4 text-left hover:bg-accent/50 transition-colors border-b"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground leading-none">
                  Unlimited access, team features, and more
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground ml-2"
              >
                View plans
              </Button>
            </div>
          </button>
        )}
        <div className="p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10">
              <ProfileMenu />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">
                {fullName}
              </span>
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};