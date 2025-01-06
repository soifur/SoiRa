import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import Cookies from 'js-cookie';

const SIDEBAR_COOKIE_NAME = 'oai-nav-state';
const SIDEBAR_LOCALSTORAGE_KEY = 'UiState.isNavigationCollapsed.1';
const COOKIE_EXPIRES = 365;

export const useSidebarState = (isOpen: boolean, onClose: () => void) => {
  const isMobile = useIsMobile();

  // Initialize sidebar state from both cookie and localStorage on mount
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      const savedCookieState = Cookies.get(SIDEBAR_COOKIE_NAME);
      const savedLocalStorageState = localStorage.getItem(SIDEBAR_LOCALSTORAGE_KEY);
      
      // If either storage indicates the sidebar should be closed
      if ((savedCookieState === '0' || savedLocalStorageState === 'true') && isOpen) {
        onClose();
      }
    }
  }, []);

  // Persist sidebar state in both cookie and localStorage for desktop only
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      // Update cookie
      Cookies.set(SIDEBAR_COOKIE_NAME, isOpen ? '1' : '0', { 
        expires: COOKIE_EXPIRES,
        sameSite: 'Lax',
        secure: false
      });

      // Update localStorage
      localStorage.setItem(SIDEBAR_LOCALSTORAGE_KEY, (!isOpen).toString());
    }
  }, [isOpen, isMobile]);

  return { isMobile };
};