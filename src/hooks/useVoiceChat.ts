import { useConversation } from '@11labs/react';
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChat = (botId: string) => {
  const [isListening, setIsListening] = useState(false);
  const conversation = useConversation();

  const startListening = useCallback(async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      
      // Start the conversation with ElevenLabs
      await conversation.startSession({
        agentId: botId // We'll use the botId as the agentId
      });
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setIsListening(false);
    }
  }, [botId, conversation]);

  const stopListening = useCallback(async () => {
    try {
      await conversation.endSession();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice chat:', error);
    }
  }, [conversation]);

  return {
    isListening,
    startListening,
    stopListening,
    isSpeaking: conversation.isSpeaking
  };
};