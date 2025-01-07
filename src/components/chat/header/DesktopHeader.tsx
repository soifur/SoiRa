import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";
import { HeaderButtons } from "./HeaderButtons";
import { QuizButton } from "./QuizButton";

interface DesktopHeaderProps {
  isChat: boolean;
  showHistory: boolean;
  onToggleHistory: () => void;
  onNewChat: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  selectedBotId: string | null;
  setSelectedBotId?: (id: string) => void;
  uniqueBots: Bot[];
  quizModeEnabled: boolean;
  onQuizComplete?: (instructions: string) => void;
}

export const DesktopHeader = ({
  isChat,
  showHistory,
  onToggleHistory,
  onNewChat,
  isSuperAdmin,
  isAdmin,
  selectedBotId,
  setSelectedBotId,
  uniqueBots,
  quizModeEnabled,
  onQuizComplete
}: DesktopHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-2">
        {isChat && !showHistory && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-dropdown-hover"
              onClick={onToggleHistory}
            >
              <Clock className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-dropdown-hover"
              onClick={onNewChat}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        
        <HeaderButtons isSuperAdmin={isSuperAdmin} isAdmin={isAdmin} />
        
        {isChat && selectedBotId && setSelectedBotId && (
          <>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger className="min-w-[180px] max-w-fit h-8 text-sm bg-transparent hover:bg-dropdown-hover">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {uniqueBots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBotId && quizModeEnabled && (
              <QuizButton 
                botId={selectedBotId} 
                onStartQuiz={() => {}} 
                onQuizComplete={onQuizComplete}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};