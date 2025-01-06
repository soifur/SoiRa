import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const SIDEBAR_COOKIE = 'chat-nav-state';
const SIDEBAR_STORAGE = 'UiState.isNavigationCollapsed.1';

export const useSidebarState = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  // Load initial state from cookies/localStorage
  useEffect(() => {
    const cookieState = Cookies.get(SIDEBAR_COOKIE);
    const localState = localStorage.getItem(SIDEBAR_STORAGE);
    
    if (cookieState === '1' || localState === 'false') {
      setIsOpen(true);
    } else if (cookieState === '0' || localState === 'true') {
      setIsOpen(false);
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen(prev => {
      const newState = !prev;
      
      // Update cookie
      Cookies.set(SIDEBAR_COOKIE, newState ? '1' : '0', { 
        expires: 365,
        sameSite: 'Lax'
      });
      
      // Update localStorage
      localStorage.setItem(SIDEBAR_STORAGE, newState ? 'false' : 'true');
      
      return newState;
    });
  };

  return {
    isOpen,
    setIsOpen,
    toggleSidebar
  };
};