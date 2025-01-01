import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const useSessionToken = () => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = Cookies.get('chat_cookie_consent');
    // Only set hasConsent if there's an explicit 'accepted' cookie
    setHasConsent(consent === 'accepted' ? true : null);

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
    Cookies.set('chat_cookie_consent', 'accepted', { expires: 365 });
    Cookies.set('chat_session_token', token, { expires: 365 });
    setSessionToken(token);
    setHasConsent(true);
  };

  const handleCookieReject = () => {
    // Remove any existing cookies when rejected
    Cookies.remove('chat_cookie_consent');
    Cookies.remove('chat_session_token');
    setHasConsent(false);
    setSessionToken(null);
  };

  return {
    sessionToken,
    hasConsent,
    handleCookieAccept,
    handleCookieReject
  };
};