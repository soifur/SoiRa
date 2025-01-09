import { useEffect, useRef, useState } from 'react';

export const useScrollBehavior = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const checkIfNearBottom = () => {
    if (!messagesEndRef.current) return true;
    const container = messagesEndRef.current.parentElement;
    if (!container) return true;
    
    // Consider "near bottom" if within 100px of bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  const handleScroll = () => {
    setIsNearBottom(checkIfNearBottom());
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    messagesEndRef,
    isNearBottom,
    scrollToBottom
  };
};