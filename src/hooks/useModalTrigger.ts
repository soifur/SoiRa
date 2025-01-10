import { useState } from 'react';

export const useModalTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    isLoading,
    setIsLoading,
    openModal,
    closeModal
  };
};