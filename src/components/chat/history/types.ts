export interface MainChatHistoryProps {
  sessionToken: string | null;
  botId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
  setSelectedBotId: (botId: string) => void;
}

interface ChatsByModelDateGroup {
  [dateGroup: string]: any[];
}

interface ModelData {
  avatar?: string;
  chats: ChatsByModelDateGroup;
}

export interface ChatsByModelAndDate {
  [modelName: string]: ModelData;
}