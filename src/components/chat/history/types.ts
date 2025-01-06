export interface ChatsByModelAndDate {
  [modelName: string]: {
    [key: string]: any[];
  };
}

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