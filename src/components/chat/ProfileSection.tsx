import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/ProfileMenu";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileSectionProps {
  showViewPlans?: boolean;
  onClose?: () => void;
}

export const ProfileSection = ({ showViewPlans = false, onClose }: ProfileSectionProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isMobile = useIsMobile();

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

  const isPaidUser = userProfile?.role === 'paid_user' || 
                    userProfile?.role === 'admin' || 
                    userProfile?.role === 'super_admin';

  return (
    <>
      <div className="flex flex-col border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {!isPaidUser && (
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
        <ProfileMenu fullName={fullName} />
      </div>
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
};