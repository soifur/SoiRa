import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistoryGroup } from "./ChatHistoryGroup";
import { getDateGroup, DATE_GROUP_ORDER } from "@/utils/dateUtils";
import { ChatsByModelAndDate } from "./types";
import { MobileNavigation } from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistoryContentProps {
  chatsByModelAndDate: ChatsByModelAndDate;
  expandedGroups: Set<string>;
  expandedModels: Set<string>;
  toggleGroup: (groupName: string) => void;
  toggleModel: (modelName: string) => void;
  currentChatId: string | null;
  onSelectChat: (chatId: string, e: React.MouseEvent) => void;
  onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

export const ChatHistoryContent = ({
  chatsByModelAndDate,
  expandedGroups,
  expandedModels,
  toggleGroup,
  toggleModel,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  isSuperAdmin,
  isAdmin,
  onClose,
}: ChatHistoryContentProps) => {
  const isMobile = useIsMobile();

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <ScrollArea className="flex-1" onClick={handleContentClick}>
      {isMobile && (
        <MobileNavigation 
          isSuperAdmin={isSuperAdmin} 
          isAdmin={isAdmin} 
          onClose={onClose}
        />
      )}
      
      <div className="p-4 space-y-4">
        {Object.entries(chatsByModelAndDate).map(([modelName, dateGroups]) => (
          <ChatHistoryGroup
            key={modelName}
            label={modelName}
            chats={[]}
            isExpanded={expandedModels.has(modelName)}
            onToggle={() => toggleModel(modelName)}
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
                  onToggle={() => toggleGroup(dateGroup)}
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
  );
};