import { ChatInput } from "./ChatInput";
import { VoiceChatControls } from "./VoiceChatControls";

interface ChatControlsProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export const ChatControls = ({
  onSend,
  isLoading,
  isSpeaking,
  isListening,
  startListening,
  stopListening
}: ChatControlsProps) => {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <ChatInput
          onSend={onSend}
          disabled={isLoading || isSpeaking}
          isLoading={isLoading}
          placeholder={isListening ? "Listening..." : "Type your message..."}
        />
        <VoiceChatControls
          isListening={isListening}
          isSpeaking={isSpeaking}
          startListening={startListening}
          stopListening={stopListening}
        />
      </div>
      {isListening && (
        <p className="text-sm text-muted-foreground mt-2">
          🎤 Speak clearly, I'm listening...
        </p>
      )}
      {isSpeaking && (
        <p className="text-sm text-muted-foreground mt-2">
          🔊 I'm speaking...
        </p>
      )}
    </div>
  );
};