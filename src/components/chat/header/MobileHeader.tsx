import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot } from "@/hooks/useBots";
import { QuizButton } from "./QuizButton";

interface MobileHeaderProps {
  isChat: boolean;
  onToggleHistory: () => void;
  selectedBotId: string | null;
  setSelectedBotId?: (id: string) => void;
  uniqueBots: Bot[];
  quizModeEnabled: boolean;
  onNewChat: () => void;
  onQuizComplete?: (instructions: string) => void;
}

export const MobileHeader = ({
  isChat,
  onToggleHistory,
  selectedBotId,
  setSelectedBotId,
  uniqueBots,
  quizModeEnabled,
  onNewChat,
  onQuizComplete
}: MobileHeaderProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      {isChat && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-dropdown-hover"
            onClick={onToggleHistory}
          >
            <Clock className="h-4 w-4" />
          </Button>

          {selectedBotId && setSelectedBotId && (
            <>
              <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                <SelectTrigger className="min-w-[200px] max-w-fit h-9 text-sm bg-transparent hover:bg-dropdown-hover">
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-dropdown-hover"
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};