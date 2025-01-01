import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const useSessionToken = () => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = Cookies.get('chat_cookie_consent');
    setHasConsent(consent === 'accepted');

    if (consent === 'accepted') {
      let token = Cookies.get('chat_session_token');
      if (!token) {
        token = uuidv4();
        Cookies.set('chat_session_token', token, { expires: 365 });
      }
      setSessionToken(token);
    }
  }, []);

  const handleCookieAccept = () => {
    const token = uuidv4();
    Cookies.set('chat_session_token', token, { expires: 365 });
    setSessionToken(token);
    setHasConsent(true);
  };

  const handleCookieReject = () => {
    setHasConsent(false);
  };

  return {
    sessionToken,
    hasConsent,
    handleCookieAccept,
    handleCookieReject
  };
};