import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onInputChange?: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  value?: string;
}

export const ChatInput = ({ 
  onSend, 
  disabled, 
  placeholder, 
  isLoading,
  onInputChange,
  onSubmit,
  value 
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = textareaRef.current?.value.trim();
    if (message) {
      if (onSubmit) {
        onSubmit(e);
      } else {
        onSend(message);
      }
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "36px";
      }
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onInputChange) {
      onInputChange(e.target.value);
    }
    adjustHeight();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "36px";
      if (value !== undefined) {
        textareaRef.current.value = value;
      }
    }
  }, [value]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end gap-2 max-w-3xl mx-auto w-full">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || "Type your message..."}
          disabled={disabled || isLoading}
          className={cn(
            "min-h-[48px] max-h-[100px] resize-none py-3 px-4 text-base",
            "bg-[#40414F] border-0 rounded-2xl focus:ring-2 focus:ring-primary/50",
            "backdrop-blur-sm"
          )}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={disabled || isLoading}
          className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};