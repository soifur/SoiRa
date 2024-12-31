import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textareaRef.current?.value.trim()) {
      onSend(textareaRef.current.value);
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // Set initial height
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 bg-background">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled}
        className="min-h-[40px] max-h-[100px] resize-none py-2 px-3"
        onKeyDown={handleKeyDown}
        onChange={adjustHeight}
      />
      <Button type="submit" size="icon" disabled={disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};