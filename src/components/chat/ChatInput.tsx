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
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder || "Type your message..."}
              disabled={disabled || isLoading}
              className="min-h-[48px] max-h-[100px] resize-none py-3 px-4 text-sm bg-accent/50 border-0 rounded-2xl focus:ring-2 focus:ring-primary/50"
              onKeyDown={handleKeyDown}
              onChange={handleChange}
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={disabled || isLoading}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};