import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VoiceChatControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export const VoiceChatControls = ({
  isListening,
  isSpeaking,
  startListening,
  stopListening
}: VoiceChatControlsProps) => {
  const { toast } = useToast();

  const handleStartListening = async () => {
    try {
      await startListening();
      toast({
        title: "Voice Chat Active",
        description: "Speak clearly and I'll listen to you",
      });
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isListening ? stopListening : handleStartListening}
      className={`text-muted-foreground hover:text-foreground ${isListening ? 'bg-red-100' : ''}`}
      disabled={isSpeaking}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};