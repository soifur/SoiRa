import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import Cookies from 'js-cookie';

const SIDEBAR_COOKIE_NAME = 'oai-nav-state';
const COOKIE_EXPIRES = 365;

export const useSidebarState = (isOpen: boolean, onClose: () => void) => {
  const isMobile = useIsMobile();

  // Initialize sidebar state from cookie on mount
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      const savedState = Cookies.get(SIDEBAR_COOKIE_NAME);
      if (savedState === '1' && !isOpen) {
        onClose();
      }
    }
  }, []);

  // Persist sidebar state in cookie for desktop only
  useEffect(() => {
    if (!isMobile && typeof window !== 'undefined') {
      Cookies.set(SIDEBAR_COOKIE_NAME, isOpen ? '1' : '0', { 
        expires: COOKIE_EXPIRES,
        sameSite: 'Lax',
        secure: false
      });
    }
  }, [isOpen, isMobile]);

  return { isMobile };
};