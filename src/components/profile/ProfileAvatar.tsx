import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  initials: string;
}

export const ProfileAvatar = ({ avatarUrl, initials }: ProfileAvatarProps) => {
  return (
    <div className="flex-shrink-0 w-10 h-10">
      <Avatar className="h-10 w-10 bg-transparent">
        <AvatarImage 
          src={avatarUrl || ''} 
          alt="Profile" 
          className="object-cover bg-transparent"
        />
        <AvatarFallback className="text-base bg-transparent">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
};