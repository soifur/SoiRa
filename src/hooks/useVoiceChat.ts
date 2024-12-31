import { useConversation } from '@11labs/react';
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useVoiceChat = (botId: string) => {
  const [isListening, setIsListening] = useState(false);
  const conversation = useConversation({
    onError: (error) => {
      console.error('Voice chat error:', error);
      setIsListening(false);
    },
    onMessage: (message) => {
      console.log('Voice chat message:', message);
    }
  });

  const startListening = useCallback(async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with ElevenLabs using the agent ID
      await conversation.startSession({
        agentId: botId
      });
      
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setIsListening(false);
      throw error;
    }
  }, [botId, conversation]);

  const stopListening = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error stopping voice chat:', error);
    } finally {
      setIsListening(false);
    }
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        conversation.endSession().catch(console.error);
      }
    };
  }, [conversation, isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    isSpeaking: conversation.isSpeaking
  };
};