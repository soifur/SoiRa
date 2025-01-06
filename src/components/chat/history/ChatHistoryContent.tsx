import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHistoryGroup } from "./ChatHistoryGroup";
import { MobileNavigation } from "./MobileNavigation";
import { DATE_GROUP_ORDER } from "@/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatsByModelAndDate } from "./types";

interface ChatHistoryContentProps {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onClose: () => void;
  chatsByModelAndDate: ChatsByModelAndDate;
  expandedModels: Set<string>;
  expandedGroups: Set<string>;
  toggleModel: (modelName: string) => void;
  toggleGroup: (groupName: string) => void;
  currentChatId: string | null;
  handleSelectChat: (chatId: string) => void;
  handleDelete: (chatId: string) => void;
}

export const ChatHistoryContent = ({
  isSuperAdmin,
  isAdmin,
  onClose,
  chatsByModelAndDate,
  expandedModels,
  expandedGroups,
  toggleModel,
  toggleGroup,
  currentChatId,
  handleSelectChat,
  handleDelete,
}: ChatHistoryContentProps) => {
  const isMobile = useIsMobile();

  return (
    <ScrollArea className="flex-1">
      {isMobile && (
        <MobileNavigation 
          isSuperAdmin={isSuperAdmin} 
          isAdmin={isAdmin} 
          onClose={onClose}
        />
      )}
      
      <div className="p-4 space-y-2">
        {Object.entries(chatsByModelAndDate).map(([modelName, modelData]) => (
          <ChatHistoryGroup
            key={modelName}
            label={modelName}
            chats={[]}
            isExpanded={expandedModels.has(modelName)}
            onToggle={() => toggleModel(modelName)}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDelete}
            isModelGroup={true}
            avatar={modelData.avatar}
          >
            {DATE_GROUP_ORDER.map((dateGroup) => {
              const chats = modelData.chats[dateGroup] || [];
              if (chats.length === 0) return null;
              
              return (
                <ChatHistoryGroup
                  key={`${modelName}-${dateGroup}`}
                  label={dateGroup}
                  chats={chats}
                  isExpanded={expandedGroups.has(dateGroup)}
                  onToggle={() => toggleGroup(dateGroup)}
                  currentChatId={currentChatId}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDelete}
                />
              );
            })}
          </ChatHistoryGroup>
        ))}
      </div>
    </ScrollArea>
  );
};