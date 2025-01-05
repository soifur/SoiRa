import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AvatarUploader } from "@/components/AvatarUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProfileSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar: profile.avatar
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <AvatarUploader
            avatar={profile?.avatar}
            onAvatarChange={(avatar) => setProfile({ ...profile, avatar })}
          />
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile?.first_name || ''}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              placeholder="First Name"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile?.last_name || ''}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              placeholder="Last Name"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </div>
    </Card>
  );
};