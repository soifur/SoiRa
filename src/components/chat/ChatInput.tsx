import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      <div className="relative flex flex-col gap-2 max-w-3xl mx-auto w-full">
        {disabled && (
          <div className="flex items-center justify-end gap-2 text-sm text-destructive">
            <span>Usage limit exceeded.</span>
            <Button
              variant="link"
              className="h-auto p-0 text-destructive font-medium hover:text-destructive/90 flex items-center gap-1"
              onClick={() => navigate('/upgrade')}
            >
              Increase your limits now
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder || "Type your message..."}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-[48px] max-h-[100px] resize-none py-3 px-4 text-base",
              "bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-ring",
              "dark:bg-[#2F2F2F] dark:border-0"
            )}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={disabled || isLoading}
            className={cn(
              "h-10 w-10 rounded-full shrink-0",
              "bg-black dark:bg-white",
              "text-white dark:text-black",
              "hover:bg-black/90 dark:hover:bg-white/90",
              "shadow-lg"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
