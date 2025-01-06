export interface ChatsByModelAndDate {
  [modelName: string]: {
    [dateGroup: string]: Chat[];
  };
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  deleted: string;
  user_id: string;
  session_token: string;
  bot_id: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: string;
  content: string;
  timestamp?: string;
  isBot: boolean;
  avatar?: string;
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

export interface ChatHistoryState {
  chatsByModelAndDate: ChatsByModelAndDate;
  expandedGroups: Set<string>;
  expandedModels: Set<string>;
}

export interface ChatHistoryActions {
  handleDelete: (chatId: string) => Promise<void>;
  handleSelectChat: (chatId: string) => Promise<void>;
  toggleGroup: (groupName: string) => void;
  toggleModel: (modelName: string) => void;
}
