import { Button } from "@/components/ui/button";
import { HelpCircle, Code, BookOpen, Lightbulb, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStartersProps {
  selectedBot?: any;
  starters?: string[];
  onStarterClick?: (value: string) => void;
}

export const MessageStarters = ({ selectedBot, starters = [], onStarterClick }: MessageStartersProps) => {
  const getStarterIcon = (starter: string) => {
    const lowerStarter = starter.toLowerCase();
    if (lowerStarter.includes('help') || lowerStarter.includes('how')) {
      return HelpCircle;
    }
    if (lowerStarter.includes('code') || lowerStarter.includes('program')) {
      return Code;
    }
    if (lowerStarter.includes('explain') || lowerStarter.includes('learn')) {
      return BookOpen;
    }
    if (lowerStarter.includes('idea') || lowerStarter.includes('suggest')) {
      return Lightbulb;
    }
    return MessageCircle;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
      {selectedBot && (
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          {selectedBot.name}
        </h2>
      )}
      <h1 className="text-4xl font-bold mb-12 text-foreground text-center">
        What can I help with?
      </h1>
      <div className="grid grid-cols-1 gap-3 w-full max-w-2xl px-4">
        {starters.map((starter, index) => {
          const Icon = getStarterIcon(starter);
          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "flex items-center justify-start gap-3 p-4 h-auto text-base w-full",
                "rounded-2xl hover:bg-accent/50 transition-colors",
                "bg-background/50 backdrop-blur-sm border-muted-foreground/20",
                "whitespace-normal text-left"
              )}
              onClick={() => onStarterClick && onStarterClick(starter)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-left break-words">{starter}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};