import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: string;
  isBot?: boolean;
  avatar?: string;
  isLoading?: boolean;
}

export const ChatMessage = ({ message, isBot, avatar, isLoading }: ChatMessageProps) => {
  return (
    <div className={`flex items-start gap-3 ${isBot ? 'bot-message' : 'user-message'}`}>
      <Avatar className="w-8 h-8 mt-1">
        {avatar ? (
          <AvatarImage src={avatar} alt="Bot avatar" />
        ) : (
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown>{message}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};