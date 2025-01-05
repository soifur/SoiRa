import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "./MobileNavigation";
import { ChatHistoryGroup } from "./ChatHistoryGroup";
import { DateGroup, DATE_GROUP_ORDER } from "@/utils/dateUtils";
import { ProfileSection } from "../ProfileSection";

interface ChatHistoryContentProps {
  chatsByModelAndDate: Record<string, Record<DateGroup, any[]>>;
  expandedGroups: Set<string>;
  expandedModels: Set<string>;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onToggleGroup: (groupName: string) => void;
  onToggleModel: (modelName: string) => void;
  onClose: () => void;
}

export const ChatHistoryContent = ({
  chatsByModelAndDate,
  expandedGroups,
  expandedModels,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onToggleGroup,
  onToggleModel,
  onClose,
}: ChatHistoryContentProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {isMobile && <MobileNavigation onClose={onClose} />}
        
        <div className="p-4 space-y-4">
          {Object.entries(chatsByModelAndDate).map(([modelName, dateGroups]) => (
            <ChatHistoryGroup
              key={modelName}
              label={modelName}
              chats={[]}
              isExpanded={expandedModels.has(modelName)}
              onToggle={() => onToggleModel(modelName)}
              currentChatId={currentChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
              isModelGroup={true}
            >
              {DATE_GROUP_ORDER.map((dateGroup) => {
                const chats = dateGroups[dateGroup] || [];
                if (chats.length === 0) return null;
                
                return (
                  <ChatHistoryGroup
                    key={`${modelName}-${dateGroup}`}
                    label={dateGroup}
                    chats={chats}
                    isExpanded={expandedGroups.has(dateGroup)}
                    onToggle={() => onToggleGroup(dateGroup)}
                    currentChatId={currentChatId}
                    onSelectChat={onSelectChat}
                    onDeleteChat={onDeleteChat}
                  />
                );
              })}
            </ChatHistoryGroup>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-auto border-t border-border">
        <ProfileSection showViewPlans={isMobile} />
      </div>
    </div>
  );
};