import { useCallback, useState } from 'react';

export function useLoading(initialValue = false) {
  const [loading, setLoading] = useState(initialValue);

  const withLoading = useCallback(async <T>(task: () => Promise<T>) => {
    setLoading(true);
    try {
      return await task();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    withLoading
  };
}
