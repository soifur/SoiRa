import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";

interface ProfileSectionProps {
  showViewPlans?: boolean;
}

export const ProfileSection = ({ showViewPlans = false }: ProfileSectionProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

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
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 min-h-[32px]">
        <div className="flex-shrink-0 w-8 h-8">
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
          onClick={() => navigate('/upgrade')}
        >
          View plans
        </Button>
      )}
    </div>
  );
};