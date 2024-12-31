import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onInputChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
}

export const ChatInput = ({ onSend, disabled, placeholder, isLoading, onInputChange, onSubmit }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    } else if (textareaRef.current?.value.trim()) {
      const message = textareaRef.current.value;
      onSend(message);
      textareaRef.current.value = "";
      textareaRef.current.style.height = "36px";
      if (onInputChange) {
        onInputChange("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 100);
      textarea.style.height = `${newHeight}px`;
      if (onInputChange) {
        onInputChange(textarea.value);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "36px";
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 bg-background">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled || isLoading}
        className="min-h-[36px] max-h-[100px] resize-none py-1.5 px-3 text-sm"
        onKeyDown={handleKeyDown}
        onChange={adjustHeight}
      />
      <Button type="submit" size="icon" disabled={disabled || isLoading}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};