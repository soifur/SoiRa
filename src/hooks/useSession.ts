import { useEffect, useState } from 'react';
import { useSessionToken } from './useSessionToken';

export const useSession = () => {
  const { sessionToken } = useSessionToken();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [sessionToken]);

  return {
    sessionToken,
    isLoading
  };
};