import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const NAV_COOKIE_KEY = '_dd_s';
const NAV_STATE_COOKIE_KEY = 'oai-nav-state';
const LOCAL_STORAGE_KEY = 'UiState.isNavigationCollapsed.1';

export const useSidebarState = (defaultOpen: boolean = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    // Initialize state from both cookie and localStorage
    const localStorageState = localStorage.getItem(LOCAL_STORAGE_KEY);
    const navStateCookie = Cookies.get(NAV_STATE_COOKIE_KEY);
    
    // Only close if both storage mechanisms indicate it should be closed
    const shouldBeOpen = !(localStorageState === 'true' && navStateCookie === '0');
    setIsOpen(shouldBeOpen);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(prev => {
      const newState = !prev;
      
      // Update localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, (!newState).toString());
      
      // Update nav state cookie
      Cookies.set(NAV_STATE_COOKIE_KEY, newState ? '1' : '0', { expires: 365 });
      
      // Update _dd_s cookie with current timestamp
      const timestamp = Date.now();
      const id = 'e5dab119-9be8-4ba9-bc6b-c41c1081c5ac'; // Example fixed ID
      const created = Date.now() - 1000; // 1 second ago
      
      Cookies.set(NAV_COOKIE_KEY, `rum=0&expire=${timestamp + 3600000}&logs=1&id=${id}&created=${created}`, {
        expires: new Date(timestamp + 3600000) // 1 hour from now
      });
      
      return newState;
    });
  };

  return {
    isOpen,
    toggleSidebar
  };
};