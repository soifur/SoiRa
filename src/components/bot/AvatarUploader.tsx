import React from "react";
import { Upload, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploaderProps {
  avatar?: string;
  botId?: string;
  onAvatarChange: (avatar: string) => void;
}

export const AvatarUploader = ({ avatar, botId, onAvatarChange }: AvatarUploaderProps) => {
  const { toast } = useToast();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Avatar image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!botId) {
        throw new Error("Bot ID is required for avatar upload");
      }

      // Generate a unique filename using bot ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${botId}_${Date.now()}.${fileExt}`;

      // Delete existing avatar if it exists
      if (avatar) {
        const existingFileName = avatar.split('/').pop();
        if (existingFileName) {
          await supabase.storage
            .from('avatars')
            .remove([existingFileName]);
        }
      }

      // Upload new avatar
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update bot record with new avatar URL
      const { error: updateError } = await supabase
        .from('bots')
        .update({ avatar: publicUrl })
        .eq('id', botId);

      if (updateError) throw updateError;

      // Update shared_bots table if it exists
      const { error: sharedBotError } = await supabase
        .from('shared_bots')
        .update({ avatar: publicUrl })
        .eq('bot_id', botId);

      if (sharedBotError) {
        console.error('Error updating shared bot avatar:', sharedBotError);
      }

      onAvatarChange(publicUrl);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-24 h-24">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {avatar ? (
          <img 
            src={avatar} 
            alt="Bot avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <label 
        htmlFor="avatar-upload" 
        className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
      >
        <Upload className="w-4 h-4 text-primary-foreground" />
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </div>
  );
};