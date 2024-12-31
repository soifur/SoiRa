import React from "react";
import { Upload, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AvatarUploaderProps {
  avatar?: string;
  onAvatarChange: (avatar: string) => void;
}

export const AvatarUploader = ({ avatar, onAvatarChange }: AvatarUploaderProps) => {
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Avatar image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
      };
      reader.readAsDataURL(file);
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