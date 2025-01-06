import { cn } from "@/lib/utils";

interface ChatHistoryContainerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  children: React.ReactNode;
}

export const ChatHistoryContainer = ({ 
  isOpen, 
  onClose,
  isMobile,
  children 
}: ChatHistoryContainerProps) => {
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow closing via click on mobile
    if (isMobile) {
      onClose();
    }
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-screen z-[200] bg-background shadow-lg transition-transform duration-300 ease-in-out border-r",
        "dark:bg-zinc-950",
        "light:bg-white light:border-gray-200",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isMobile ? "w-full" : "w-80"
      )}
      onClick={handleContainerClick}
    >
      {children}
    </div>
  );
};