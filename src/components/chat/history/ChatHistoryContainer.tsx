import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistoryContainerProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export const ChatHistoryContainer = ({ isOpen, children }: ChatHistoryContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "fixed top-0 left-0 h-screen z-[200] bg-background shadow-lg transition-transform duration-300 ease-in-out border-r",
      "dark:bg-zinc-950",
      "light:bg-white light:border-gray-200",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isMobile ? "w-full" : "w-72"
    )}>
      <div className="flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};