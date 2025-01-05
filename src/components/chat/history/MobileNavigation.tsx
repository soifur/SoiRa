import { Button } from "@/components/ui/button";
import { Bot, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileNavigationProps {
  onClose: () => void;
}

export const MobileNavigation = ({ onClose }: MobileNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 border-b border-border">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-accent"
          onClick={() => {
            navigate('/bots');
            onClose();
          }}
        >
          <Bot className="mr-2 h-4 w-4" />
          My Bots
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-accent"
          onClick={() => {
            navigate('/archive');
            onClose();
          }}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
      </div>
    </div>
  );
};