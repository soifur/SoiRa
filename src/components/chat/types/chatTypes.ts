import { Bot } from "@/hooks/useBots";

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  avatar?: string;
}

export interface MessageListProps {
  messages: Message[];
  selectedBot?: Bot;
  starters?: string[];
  onStarterClick?: (starter: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onClearChat?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  isQuizMode?: boolean;
  onStartQuiz?: () => void;
}