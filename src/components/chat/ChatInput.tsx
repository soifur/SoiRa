import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  isLoading,
  disabled,
  onInputChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={disabled ? "Select a bot to start chatting" : "Type your message..."}
        disabled={isLoading || disabled}
        className="flex-1 h-8"
        style={{ minHeight: '32px' }}
      />
      <Button type="submit" disabled={isLoading || disabled}>
        {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
      </Button>
    </form>
  );
};