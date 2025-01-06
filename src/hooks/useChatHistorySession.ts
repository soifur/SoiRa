import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import Cookies from 'js-cookie';

const SESSION_TOKEN_COOKIE = '_chat_session';
const COOKIE_EXPIRES = 365;

export const useChatHistorySession = (initialSessionToken: string | null) => {
  const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken);

  useEffect(() => {
    const initializeSessionToken = async () => {
      // First check for existing cookie
      let token = Cookies.get(SESSION_TOKEN_COOKIE);
      
      if (!token) {
        // If no cookie, try to get user ID
        const { data: { user } } = await supabase.auth.getUser();
        token = user?.id || initialSessionToken;
        
        // Set cookie if we have a token
        if (token) {
          Cookies.set(SESSION_TOKEN_COOKIE, token, { 
            expires: COOKIE_EXPIRES,
            sameSite: 'Lax',
            secure: false
          });
        }
      }
      
      setSessionToken(token);
    };

    initializeSessionToken();
  }, [initialSessionToken]);

  return sessionToken;
};