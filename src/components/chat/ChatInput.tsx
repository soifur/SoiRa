import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Globe } from "lucide-react";

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
          <div className="relative flex-1 overflow-hidden rounded-2xl bg-accent/50">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder || "Message ChatGPT..."}
              disabled={disabled || isLoading}
              className="min-h-[36px] max-h-[100px] resize-none py-3 px-4 pr-12 text-sm bg-transparent border-0 focus:ring-0"
              onKeyDown={handleKeyDown}
              onChange={handleChange}
            />
            <div className="absolute bottom-2 left-2 flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl opacity-50 hover:opacity-100 transition-opacity"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-xl opacity-50 hover:opacity-100 transition-opacity"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={disabled || isLoading}
            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};